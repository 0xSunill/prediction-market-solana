pub mod constants;
pub mod error;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use state::*;

declare_id!("BvCRDzi8M5f5NREyoKZ62bjxR5kN1yiKu4iHqTmFCzcY");

#[program]
pub mod prediction_market {
    use anchor_lang::system_program::{transfer, Transfer};

    use super::*;

    pub fn create_market(
        ctx: Context<CreateMarket>,
        market_id: u64,
        question: String,
        resolution_time: i64,
    ) -> Result<()> {
        require!(question.len() <= MAX_QUESTION_LEN, MarketError::OverFlow);

        let clock = Clock::get()?;
        require!(
            resolution_time > clock.unix_timestamp,
            MarketError::ResolutionTimeInThePast
        );

        let market = &mut ctx.accounts.market;
        market.creator = ctx.accounts.creator.key();
        market.market_id = market_id;
        market.question = question;
        market.resolution_time = resolution_time;
        market.creation_date = clock.unix_timestamp as u64;
        market.expiry_date = resolution_time as u64;
        market.yes_pool = 0;
        market.no_pool = 0;
        market.resolved = false;
        market.outcome = None;
        market.bump = ctx.bumps.market;
        Ok(())
    }

    pub fn place_bet(ctx: Context<PlaceBet>, amount: u64, bet_yes: bool) -> Result<()> {
        require!(amount > 0, MarketError::InvalidBetAmount);

        let clock = Clock::get()?;
        let market = &mut ctx.accounts.market;

        require!(!market.resolved, MarketError::MarketResolved);
        require!(
            clock.unix_timestamp < market.resolution_time,
            MarketError::MarketResolved
        );

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.market.to_account_info(),
                },
            ),
            amount,
        )?;

        let market = &mut ctx.accounts.market;

        if bet_yes {
            market.yes_pool = market
                .yes_pool
                .checked_add(amount)
                .ok_or(MarketError::OverFlow)?;
        } else {
            market.no_pool = market
                .no_pool
                .checked_add(amount)
                .ok_or(MarketError::OverFlow)?;
        }

        let position = &mut ctx.accounts.user_position;
        if position.market == Pubkey::default() {
            position.market = market.key();
            position.user = ctx.accounts.user.key();
            let (_, bump) = Pubkey::find_program_address(
                &[
                    b"position",
                    market.key().as_ref(),
                    ctx.accounts.user.key().as_ref(),
                ],
                ctx.program_id,
            );
            position.bump = bump;
        }

        if bet_yes {
            position.yes_amount = position
                .yes_amount
                .checked_add(amount)
                .ok_or(MarketError::OverFlow)?;
        } else {
            position.no_amount = position
                .no_amount
                .checked_add(amount)
                .ok_or(MarketError::OverFlow)?;
        }

        Ok(())
    }

    pub fn resolve_market(ctx: Context<ResolveMarket>, outcome: bool) -> Result<()> {
        let clock = Clock::get()?;
        let market = &ctx.accounts.market;

        require!(
            clock.unix_timestamp >= market.resolution_time,
            MarketError::MarketNotResolved
        );

        require!(!market.resolved, MarketError::MarketResolved);

        let market = &mut ctx.accounts.market;
        market.resolved = true;
        market.outcome = Some(outcome);
        Ok(())
    }

    pub fn claim_winnings(ctx: Context<ClaimWinnings>) -> Result<()> {
        let market = &ctx.accounts.market;
        let position = &ctx.accounts.user_position;

        require!(market.resolved, MarketError::MarketNotResolved);

        require!(!position.claimed, MarketError::AlreadyClaimed);

        let outcome = market.outcome.unwrap();

        let (user_winning_bet, total_winning_pool, total_losing_pool) = if outcome {
            (position.yes_amount, market.yes_pool, market.no_pool)
        } else {
            (position.no_amount, market.no_pool, market.yes_pool)
        };

        require!(user_winning_bet > 0, MarketError::NoPosition);


        // for example
        // user_winning_bet(my bet) = 20
        // total_losing_pool(opposing bet) = 40
        // total_winning_pool(my bet) = 20
        // 20 * 40 / 20 = 40   
        // total amount i get is 40+20 = 60 (winnings + my initial bet)
        let winnings = (user_winning_bet as u128)
            .checked_mul(total_losing_pool as u128)
            .ok_or(MarketError::OverFlow)?
            .checked_div(total_winning_pool as u128)
            .ok_or(MarketError::OverFlow)? as u64;

        let total_payout = user_winning_bet
            .checked_add(winnings)
            .ok_or(MarketError::OverFlow)?;

        let market_account_info = ctx.accounts.market.to_account_info();
        let user_account_info = ctx.accounts.user.to_account_info();

        **market_account_info.try_borrow_mut_lamports()? -= total_payout;
        **user_account_info.try_borrow_mut_lamports()? += total_payout;

        let position = &mut ctx.accounts.user_position;
        position.claimed = true;
        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(market_id: u64, question: String)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Market::INIT_SPACE,
        seeds = [b"market", creator.key().as_ref(), &market_id.to_le_bytes()],
        bump,
    )]
    pub market: Account<'info, Market>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::INIT_SPACE,
        seeds = [b"position", market.key().as_ref(), user.key().as_ref()],
        bump,
    )]
    pub user_position: Account<'info, UserPosition>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(
        constraint = creator.key() == market.creator
    )]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
pub struct ClaimWinnings<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"market", market.creator.as_ref(), &market.market_id.to_le_bytes()],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    #[account(
        mut,
        seeds = [b"position", market.key().as_ref(), user.key().as_ref()],
        bump = user_position.bump,
        constraint = user_position.user == user.key(),
    )]
    pub user_position: Account<'info, UserPosition>,
}

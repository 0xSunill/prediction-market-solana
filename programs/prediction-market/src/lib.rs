pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BvCRDzi8M5f5NREyoKZ62bjxR5kN1yiKu4iHqTmFCzcY");

#[program]
pub mod prediction_market {
    use std::marker;

    use anchor_lang::system_program::transfer;

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
        market.bump = bump;
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
                ctx.accounts.system_program.to_account_info(),
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
                &[b"position", market.key().as_ref(), ctx.accounts.user.key().as_ref()],
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

    pub fn resolve_market(ctx:Context<ResolveMarket>,outcome:bool)->Result<()>{
        let clock = Clock::get()?;
        let market = &ctx.accounts.market;

        require!(
            clock.unix_timestamp >= market.resolution_time,
            MarketError::MarketNotResolved
        );

        require!(!market.resolved,MarketError::MarketResolved);

       let market = &mut ctx.accounts.market;
       market.resolved = true;
       market.outcome = Some(outcome);
        Ok(())
    }
}

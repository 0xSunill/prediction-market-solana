use anchor_lang::prelude::*;

#[error_code]
pub enum MarketError {
    #[msg("Question is too long")]
    OverFlow,
    #[msg("Resolution time is in the past")]
    ResolutionTimeInThePast,
    #[msg("Invalid bet amount")]
    InvalidBetAmount,
    #[msg("Market is already resolved")]
    MarketResolved,
    #[msg("Market is not resolved yet")]
    MarketNotResolved,
    #[msg("Winnings already claimed")]
    AlreadyClaimed,
    #[msg("No position found")]
    NoPosition,
}

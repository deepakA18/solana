#![allow(unexpected_cfgs)]

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("fhKX5CDwV8RU6Kq7FhMuA16zE42mHNSaeiA4bCjxt65");

#[program]
pub mod swap {
    use super::*;

    pub fn make_offer(context: Context<MakeOffer>, id: u64, token_a_offered_amount:u64, token_b_wanted_amount: u64) -> Result<()> {
       instructions::make_offer::send_offered_tokens_to_vault(&context, token_a_offered_amount)?;
       instructions::make_offer::save_offer(context, id , token_b_wanted_amount)
    }
}

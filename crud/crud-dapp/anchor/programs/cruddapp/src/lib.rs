#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

//6SU4Xcvq4j6sWNssAe6254ReEBBpeyxLagtzzoCyJSsM

declare_id!("6SU4Xcvq4j6sWNssAe6254ReEBBpeyxLagtzzoCyJSsM");

#[program]
pub mod cruddapp {
    use super::*;

  //instructions
  pub fn create_journal_entry(ctx: Context<CreateEntry>, title: String, message: String) -> Result<()> {
    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.owner = *ctx.accounts.owner.key; //referrencing the owner's key
    journal_entry.title = title;
    journal_entry.message = message;

    Ok(())
  }

  pub fn update_journal_entry(ctx: Context<UpdateEntry>, _title:String, message: String) -> Result<()> {
    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.message = message;

    Ok(())
  }

  pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, _title: String, _message: String) -> Result<()> {
    Ok(())
  }
}

//Context DS:

#[derive(Accounts)]
#[instruction(title: String)] //to define we r pulling the title from the instruction
pub struct CreateEntry<'info>{
  #[account(
    init,  //to initialize the acc
    seeds=[title.as_bytes(), owner.key().as_ref()], 
    bump, //add bump, whenever u use seeds
    space = 8 + JournalEntryState::INIT_SPACE, //space that will pay on-chain rent (start with 8 as it is anchor discriminator) 
    payer = owner,
  )]

  pub journal_entry: Account<'info, JournalEntryState>,

  #[account(mut)] //state of the owner's acc will be changing 
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info>{
  #[account(
    mut,
    seeds=[title.as_bytes(), owner.key().as_ref()], 
    bump,
    realloc = 8 + JournalEntryState::INIT_SPACE, //getting back the extra lamports (dynamic usage of space)
    realloc::payer = owner,
    realloc::zero = true, //setting space allocation to zero to then recalculating everything
  )]

  pub journal_entry: Account<'info, JournalEntryState>,

  #[account(mut)] //state of the owner's acc will be changing 
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System> //system program
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
  #[account(
    mut,
    seeds=[title.as_bytes(), owner.key().as_ref()], //seeds and bump are used to be able to derive the correct PDA
    bump,
    close = owner, //if u run this instruction it gonna close the account (but only if the pubkey of close = signer of the instruction)
  )]

  pub journal_entry: Account<'info, JournalEntryState>,

  #[account(mut)] 
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System> 
}

//State:

#[account] 
#[derive(InitSpace)]
pub struct JournalEntryState {
  pub owner: Pubkey,
  #[max_len(50)]
  pub title: String,
  #[max_len(1000)]
  pub message: String,

}
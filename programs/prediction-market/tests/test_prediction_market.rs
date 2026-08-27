use {
    anchor_lang::{
        prelude::Pubkey,
        solana_program::{instruction::Instruction, system_program},
        AccountDeserialize, InstructionData, ToAccountMetas,
    },
    litesvm::LiteSVM,
    solana_keypair::Keypair,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_transaction::versioned::VersionedTransaction,
    std::time::{SystemTime, UNIX_EPOCH},
};

#[test]
fn test_prediction_market() {
    let program_id = prediction_market::id();
    let creator = Keypair::new();
    let user1 = Keypair::new();
    let user2 = Keypair::new();

    let mut svm = LiteSVM::new();
    let bytes = include_bytes!(concat!(
        env!("CARGO_TARGET_TMPDIR"),
        "/../deploy/prediction_market.so"
    ));
    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&creator.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&user1.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&user2.pubkey(), 1_000_000_000).unwrap();

    let current_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    let mut clock = svm.get_sysvar::<anchor_lang::solana_program::clock::Clock>();
    clock.unix_timestamp = current_time;
    svm.set_sysvar(&clock);

    let market_id: u64 = 1;
    let resolution_time = current_time + 10;
    let question = "Will Solana hit $1000?".to_string();

    let market_pda = Pubkey::find_program_address(
        &[
            b"market",
            creator.pubkey().as_ref(),
            &market_id.to_le_bytes(),
        ],
        &program_id,
    )
    .0;

    let instruction = Instruction::new_with_bytes(
        program_id,
        &prediction_market::instruction::CreateMarket {
            market_id,
            question,
            resolution_time,
        }
        .data(),
        prediction_market::accounts::CreateMarket {
            creator: creator.pubkey(),
            market: market_pda,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&creator.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&creator]).unwrap();
    svm.send_transaction(tx).unwrap();

    let market_account = svm.get_account(&market_pda).unwrap();
    let mut data: &[u8] = &market_account.data;
    let market_state = prediction_market::state::Market::try_deserialize(&mut data).unwrap();
    assert_eq!(market_state.market_id, market_id);

    let user1_position_pda = Pubkey::find_program_address(
        &[
            b"position",
            market_pda.as_ref(),
            user1.pubkey().as_ref(),
        ],
        &program_id,
    ).0;

    let instruction = Instruction::new_with_bytes(
        program_id,
        &prediction_market::instruction::PlaceBet {
            amount: 100_000_000,
            bet_yes: true,
        }
        .data(),
        prediction_market::accounts::PlaceBet {
            user: user1.pubkey(),
            market: market_pda,
            user_position: user1_position_pda,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&user1.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&user1]).unwrap();
    svm.send_transaction(tx).unwrap();

    let user2_position_pda = Pubkey::find_program_address(
        &[
            b"position",
            market_pda.as_ref(),
            user2.pubkey().as_ref(),
        ],
        &program_id,
    ).0;

    let instruction = Instruction::new_with_bytes(
        program_id,
        &prediction_market::instruction::PlaceBet {
            amount: 50_000_000,
            bet_yes: false,
        }
        .data(),
        prediction_market::accounts::PlaceBet {
            user: user2.pubkey(),
            market: market_pda,
            user_position: user2_position_pda,
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&user2.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&user2]).unwrap();
    svm.send_transaction(tx).unwrap();

    let mut clock = svm.get_sysvar::<anchor_lang::solana_program::clock::Clock>();
    clock.unix_timestamp += 20;
    svm.set_sysvar(&clock);

    let instruction = Instruction::new_with_bytes(
        program_id,
        &prediction_market::instruction::ResolveMarket {
            outcome: true,
        }
        .data(),
        prediction_market::accounts::ResolveMarket {
            creator: creator.pubkey(),
            market: market_pda,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&creator.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&creator]).unwrap();
    svm.send_transaction(tx).unwrap();

    let instruction = Instruction::new_with_bytes(
        program_id,
        &prediction_market::instruction::ClaimWinnings {}
        .data(),
        prediction_market::accounts::ClaimWinnings {
            user: user1.pubkey(),
            market: market_pda,
            user_position: user1_position_pda,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&user1.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&user1]).unwrap();
    svm.send_transaction(tx).unwrap();

    let user1_position_account = svm.get_account(&user1_position_pda).unwrap();
    let mut data: &[u8] = &user1_position_account.data;
    let pos_state = prediction_market::state::UserPosition::try_deserialize(&mut data).unwrap();
    assert!(pos_state.claimed);
}

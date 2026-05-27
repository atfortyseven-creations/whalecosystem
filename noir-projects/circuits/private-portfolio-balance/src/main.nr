// noir-projects/circuits/private-portfolio-balance/src/main.nr
use dep::aztec::prelude::*;

#[aztec::main]
fn aggregate_portfolio(
    // Private inputs: UTXO notes representing portfolio components
    asset_a_balance: Field,
    asset_b_balance: Field,
    exchange_rate: Field,
    // Public input: The claimed total exposure value
    claimed_total_exposure: Field,
) -> Field {
    // System: Calculate total exposure natively
    let calculated_exposure = (asset_a_balance * exchange_rate) + asset_b_balance;
    
    // Constraint: Verify Private balance calculation
    constrain calculated_exposure == claimed_total_exposure;
    
    // Emits the public total without revealing asset distribution
    claimed_total_exposure
}

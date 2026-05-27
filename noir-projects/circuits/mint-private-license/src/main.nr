// noir-projects/circuits/mint-private-license/src/main.nr
use dep::aztec::prelude::*;
use dep::aztec_nr::account::Account;

#[aztec::main]
fn mint_private_license(
    // Private inputs: Private User Proof
    user_address_secret: Field,
    payment_receipt_hash: Field,
    // Public inputs:
    license_id: Field,
) -> Field {
    // Private Verification
    constrain user_address_secret != 0;
    
    // Hash receipt to confirm payment without exposing financial origin
    let derived_license = std::hash::pedersen([payment_receipt_hash]);
    constrain derived_license == license_id;
    
    // Emits the Metrics License ID natively
    license_id
}

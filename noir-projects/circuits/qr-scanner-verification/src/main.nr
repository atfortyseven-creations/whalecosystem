// noir-projects/circuits/qr-scanner-verification/src/main.nr
use dep::aztec::prelude::*;

#[aztec::main]
fn verify_qr_scanner(
    // Private inputs: Scanned QR code embedded data
    qr_payload_hash: Field,
    user_device_key: Field,
    // Public inputs:
    session_id: Field,
) -> Field {
    // System: Confirm QR validity without leaking payload
    let computed_session = std::hash::pedersen([qr_payload_hash, user_device_key]);
    constrain computed_session == session_id;
    
    // Output valid session for Active handshake
    session_id
}

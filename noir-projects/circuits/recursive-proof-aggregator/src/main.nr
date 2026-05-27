// noir-projects/circuits/recursive-proof-aggregator/src/main.nr
use dep::aztec::prelude::*;

#[aztec::main]
fn recursive_proof_aggregator(
    // Private inputs: Array of proof hashes from inner circuits
    proof_hash_1: Field,
    proof_hash_2: Field,
    proof_hash_3: Field,
    // Public inputs:
    batch_root_hash: Field,
) -> Field {
    // System: Recursive Aggregation
    // Accumulate the proof hashes using lookup tables optimization
    let intermediate_hash = std::hash::pedersen([proof_hash_1, proof_hash_2]);
    let final_computed_root = std::hash::pedersen([intermediate_hash, proof_hash_3]);
    
    constrain final_computed_root == batch_root_hash;
    
    // Returns Active verified aggregated root
    batch_root_hash
}

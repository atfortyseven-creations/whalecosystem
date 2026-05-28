contract WhaleChat {
    use dep::aztec::prelude::{
        AztecAddress, NoteHeader, PrivateSet, PrivateContext, Map, PublicMutable,
        FunctionSelector, EmitWarning
    };
    use dep::value_note::{
        note::{ValueNote, VALUE_NOTE_LEN},
        utils::{increment, decrement}
    };

    // We store an encrypted payload hash that represents the message
    // In a real production system, the payload is encrypted off-chain and the hash/identifier is stored on-chain
    #[aztec(storage)]
    struct Storage {
        messages: Map<AztecAddress, PrivateSet<ValueNote>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {
        // Initialization logic here
    }

    #[aztec(private)]
    fn send_message(recipient: AztecAddress, message_hash: Field) {
        // Store the message hash as a ValueNote in the recipient's private set
        // The value represents the encrypted content hash
        let mut note = ValueNote::new(message_hash, recipient);
        
        // Insert the note into the recipient's private set
        // The sender cannot read it after sending unless they also encrypt it for themselves (which we omit here for simplicity)
        storage.messages.at(recipient).insert(&mut note, true);
    }
}

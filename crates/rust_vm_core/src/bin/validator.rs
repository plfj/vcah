use rust_vm_core::*;
use std::env;
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: {} <command> [args...]", args[0]);
        eprintln!("Commands:");
        eprintln!("  validate-secret <hash>    - Validate secret hash");
        eprintln!("  compute-hash <text>       - Compute SHA-512 hash");
        eprintln!("  inject-blocks <file>      - Inject hash blocks into file");
        process::exit(1);
    }

    match args[1].as_str() {
        "validate-secret" => {
            if args.len() < 3 {
                eprintln!("Error: Missing hash argument");
                process::exit(1);
            }
            let hash = &args[2];
            if validate_secret_hash(hash) {
                println!("✓ Secret hash is valid");
            } else {
                eprintln!("✗ Secret hash is invalid");
                process::exit(1);
            }
        }

        "compute-hash" => {
            if args.len() < 3 {
                eprintln!("Error: Missing text argument");
                process::exit(1);
            }
            let text = &args[2];
            let hash = compute_sha512(text.as_bytes());
            println!("SHA-512: {}", hash);
        }

        "generate-secret" => {
            let secret_hash = compute_sha512(b"ATOMIC_PYVM");
            println!("ATOMIC_PYVM Secret Hash:");
            println!("{}", secret_hash);
        }

        _ => {
            eprintln!("Unknown command: {}", args[1]);
            process::exit(1);
        }
    }
}

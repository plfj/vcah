use rust_vm_core::kernel::opcode::scrambler::generate_scramble_table;

#[test]
fn test_opcode_scramble_deterministic_bijective() {
    let table1 = generate_scramble_table(884721);
    let table2 = generate_scramble_table(884721);

    assert_eq!(table1.entries.len(), table2.entries.len());
    for (e1, e2) in table1.entries.iter().zip(table2.entries.iter()) {
        assert_eq!(e1.scrambled_byte, e2.scrambled_byte);
        assert_eq!(e1.cpython_name, e2.cpython_name);
    }
}

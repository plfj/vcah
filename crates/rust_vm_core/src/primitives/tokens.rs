//! Fundamental Lexical Tokens for the Python bytecode and AST representation.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TokenKind {
    Identifier(String),
    LiteralInteger(i64),
    LiteralFloat(String),
    LiteralString(String),
    LiteralBytes(Vec<u8>),
    Keyword(String),
    Operator(String),
    Delimiter(char),
    Whitespace,
    Comment(String),
    EndOfStream,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SourceSpan {
    pub start_line: u32,
    pub start_col: u32,
    pub end_line: u32,
    pub end_col: u32,
}

impl SourceSpan {
    pub const fn zero() -> Self {
        Self {
            start_line: 1,
            start_col: 0,
            end_line: 1,
            end_col: 0,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Token {
    pub kind: TokenKind,
    pub span: SourceSpan,
    pub raw: String,
}

impl Token {
    pub fn new(kind: TokenKind, raw: impl Into<String>, span: SourceSpan) -> Self {
        Self {
            kind,
            raw: raw.into(),
            span,
        }
    }
}

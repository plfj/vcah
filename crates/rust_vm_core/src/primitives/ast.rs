//! Pure AST primitives representing abstract syntax trees for Python deconstruction.

use super::tokens::SourceSpan;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AstLiteral {
    None,
    Bool(bool),
    Int(i64),
    Float(String),
    Str(String),
    Bytes(Vec<u8>),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum BinaryOp {
    Add,
    Sub,
    Mult,
    Div,
    FloorDiv,
    Mod,
    Pow,
    LShift,
    RShift,
    BitOr,
    BitXor,
    BitAnd,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AstExpr {
    Constant {
        val: AstLiteral,
        span: SourceSpan,
    },
    Name {
        id: String,
        span: SourceSpan,
    },
    BinOp {
        left: Box<AstExpr>,
        op: BinaryOp,
        right: Box<AstExpr>,
        span: SourceSpan,
    },
    UnaryOp {
        op: String,
        operand: Box<AstExpr>,
        span: SourceSpan,
    },
    Call {
        func: Box<AstExpr>,
        args: Vec<AstExpr>,
        span: SourceSpan,
    },
    Lambda {
        args: Vec<String>,
        body: Box<AstExpr>,
        span: SourceSpan,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AstStmt {
    Assign {
        targets: Vec<String>,
        value: AstExpr,
        span: SourceSpan,
    },
    Expr {
        value: AstExpr,
        span: SourceSpan,
    },
    If {
        test: AstExpr,
        body: Vec<AstStmt>,
        orelse: Vec<AstStmt>,
        span: SourceSpan,
    },
    While {
        test: AstExpr,
        body: Vec<AstStmt>,
        span: SourceSpan,
    },
    For {
        target: String,
        iter: AstExpr,
        body: Vec<AstStmt>,
        span: SourceSpan,
    },
    FunctionDef {
        name: String,
        args: Vec<String>,
        body: Vec<AstStmt>,
        span: SourceSpan,
    },
    Return {
        value: Option<AstExpr>,
        span: SourceSpan,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AstModule {
    pub body: Vec<AstStmt>,
}

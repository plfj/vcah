import { spawnSync } from 'child_process';

export interface LambdaAstMorpherOptions {
  loop?: number;
  seed?: number;
}

export class LambdaAstMorpherService {
  /**
   * Transforms Python source code into heavily nested lambda expressions,
   * AST-level string and integer obfuscation, control-flow match-cases,
   * and exception-driven execution.
   */
  public static morphSource(sourceCode: string, options?: LambdaAstMorpherOptions): string {
    if (!sourceCode || sourceCode.trim().length === 0) {
      return sourceCode;
    }

    try {
      const loopCount = Math.max(1, Math.min(options?.loop ?? 1, 3));
      const pythonScript = `
import ast, sys, random, string

source_code = sys.stdin.read()

def rd():
    return ''.join(__import__('random').choices([chr(i) for i in range(0x4e00, 0x9fff)], k=5))

_join = rd()
_int = rd()
_str = rd()
_bool = rd()
_type = rd()
_bytes = rd()
_vars = rd()
array = rd()
_ip = rd()
_bytearray = rd()
vaicalon = rd()
___import__ = rd()
_movdiv = rd()
_hexrun = rd()
_argshexrun = rd()
_eval = rd()
_list = rd()
_map = rd()
_idk = rd()
nuyenbuiltins = rd()
_memoryerror = rd()
rpq = rd()
__print = r"tryᅠ"
__input = r"exceptᅠ"

def _byte(v):
    return f"{vaicalon}({int(v) + 0xFFFFFFFFFFFFFFFFFFFFFF})"

def obfstr(string):
    global _hexrun
    global _join
    keys = []
    magic = random.randint(1000000, 9999999)
    for char in string:
        logic = random.randint(1, 4)
        if logic == 1:
            logic = '+'
        elif logic == 2:
            logic = '*'
        elif logic == 3:
            logic = '<<'
        else:
            logic = '^'
        
        key = ord(char) + 3333333333333333333333333333333333333333333333333333333333242422222222222222222722222233    
        key2 = magic
        
        if logic == "^":
            key3 = ~key ^ ~magic
            keys.append(f"(lambda: {_hexrun}({key2} ^ {key3}))()")
        elif logic == "<<":
            magic = random.randint(1, 19)
            key3 = key << magic
            PT = ">>"
            keys.append(f"(lambda: {_hexrun}({key3} {PT} {magic}))()")
        else:
            if logic == "+":
                PT = "-"
            else:
                PT = "//"
            key3 = eval(f"{key} {logic} {magic}")
            keys.append(f"(lambda: {_hexrun}({key3} {PT} {key2}))()")
    
    joined_keys = ', '.join(keys)
    return f"(lambda: {_join}([{joined_keys}]))()"

def obfint(v):
    n = rd()
    global _idk
    if 'bool' in str(type(v)):
        if str(v)=='True':
            return f'(lambda: (lambda {n}: {n} + (lambda : {vaicalon}({(1+0xFFFFFFFFFFFFFFFFFFFFFF)}))())(0) == 1)()'
        else:
            return f'(lambda: (lambda {n}: {n} - (lambda : {vaicalon}(({(1+0xFFFFFFFFFFFFFFFFFFFFFF)} ) ) )())(0) == 1)()'
    else:
        return f'(lambda: {_idk}({_byte(int(v))}))()'

def random_match_case():
    var1 = ast.Constant(value=rd(), kind=None)
    var2 = ast.Constant(value=rd(), kind=None)
    return ast.Match(
        subject=ast.Compare(
            left=var1,
            ops=[ast.Eq()],
            comparators=[var2],
        ),
        cases=[
            ast.match_case(
                pattern=ast.MatchValue(value=ast.Constant(value=True, kind=None)),
                body=[
                    ast.Assign(
                        lineno=0,
                        col_offset=0,
                        targets=[],
                        value=[ast.Raise(
                            exc=ast.Call(
                                func=ast.Name(id=_memoryerror, ctx=ast.Load()),
                                args=[],
                                keywords=[],
                            ),
                            cause=None
                        )],
                    )
                ],
            ),
            ast.match_case(
                pattern=ast.MatchValue(value=ast.Constant(value=False, kind=None)),
                body=[
                    ast.Assign(
                        lineno=0,
                        col_offset=0,
                        targets=[ast.Name(id=rd(), ctx=ast.Store())],
                        value=ast.Constant(value=[[True], [False]], kind=None),
                    ),
                    ast.Expr(
                        lineno=0,
                        col_offset=0,
                        value=ast.Call(
                            func=ast.Name(id=_str, ctx=ast.Load()),
                            args=[ast.Constant(value=[rd()], kind=None)],
                            keywords=[],
                        ),
                    ),
                ],
            ),
        ],
    )

def trycatch(body, loop=${loopCount}):
    ar = []
    for x in body:
        j = x
        for _ in range(loop):
            j = ast.Try(
                body=[random_match_case()],
                handlers=[
                    ast.ExceptHandler(
                        type=ast.Name(id=_memoryerror, ctx=ast.Load()),
                        name=rd(),
                        body=[j],
                    )
                ],
                orelse=[],
                finalbody=[],
            )
            j.body.append(
                ast.Raise(
                    exc=ast.Call(
                        func=ast.Name(id=_memoryerror, ctx=ast.Load()),
                        args=[],
                        keywords=[],
                    ),
                    cause=None,
                )
            )
        ar.append(j)
    return ar

def obfuscate(node):
    for i in ast.walk(node):
        if isinstance(i, (ast.Global, ast.Nonlocal)):
            continue
        for f, v in ast.iter_fields(i):
            if isinstance(v, list):
                ar = []
                for j in v:
                    try:
                        if isinstance(j, ast.Constant) and isinstance(j.value, str):
                            ar.append(ast.parse(obfstr(j.value)).body[0].value)
                        elif isinstance(j, ast.Constant) and isinstance(j.value, (int, bool)):
                            ar.append(ast.parse(obfint(j.value)).body[0].value)
                        elif isinstance(j, ast.AST):
                            ar.append(j)
                    except Exception:
                        ar.append(j)
                setattr(i, f, ar)
            else:
                try:
                    if isinstance(v, ast.Constant) and isinstance(v.value, str):
                        setattr(i, f, ast.parse(obfstr(v.value)).body[0].value)
                    elif isinstance(v, ast.Constant) and isinstance(v.value, (int, bool)):
                        setattr(i, f, ast.parse(obfint(v.value)).body[0].value)
                except Exception:
                    pass

def rename_function(node, ol, nn):
    for i in ast.walk(node):
        if isinstance(i, ast.FunctionDef) and i.name == ol:
            i.name = nn
        elif isinstance(i, ast.Attribute) and isinstance(i.value, ast.Name) and i.value.id == ol:
            i.value.id = nn
        elif isinstance(i, ast.Call) and isinstance(i.func, ast.Name) and i.func.id == ol:
            i.func.id = nn
        elif isinstance(i, ast.Name) and i.id == ol:
            i.id = nn
    return node

tree = ast.parse(source_code)
tree = rename_function(tree, 'print', __print)
tree = rename_function(tree, 'input', __input)
tree = rename_function(tree, '__import__', ___import__)
tree = rename_function(tree, 'list', _list)
tree = rename_function(tree, 'str', _str)
tree = rename_function(tree, 'int', _int)
tree = rename_function(tree, 'bool', _bool)
tree = rename_function(tree, 'type', _type)
tree = rename_function(tree, 'bytes', _bytes)
tree = rename_function(tree, 'vars', _vars)
tree = rename_function(tree, 'bytearray', _bytearray)
tree = rename_function(tree, 'map', _map)
tree = rename_function(tree, 'eval', _eval)

obfuscate(tree)
tree.body = trycatch(tree.body, ${loopCount})

header = f'''
_bi_resolver = (lambda a:(lambda b:(lambda c:(lambda d:d.get(''.join(map(chr,(95,95,98,117,105,108,116,105,110,115,95,95))),{{}}))(vars(c.modules['builtins'])))(b('sys')))(a['__import__']))(vars(globals()['__builtins__']) if hasattr(globals()['__builtins__'], '__dict__') else globals()['__builtins__'])
{nuyenbuiltins} = _bi_resolver if (isinstance(_bi_resolver, dict) and len(_bi_resolver) > 0) else getattr(__builtins__, '__dict__', vars(__builtins__) if hasattr(__builtins__, '__dict__') else __builtins__)
{_memoryerror} = MemoryError
{_str} = (lambda f: lambda *a, **k: f(*a, **k))(str)
{_int} = (lambda f: lambda *a, **k: f(*a, **k))(int)
{_bool} = (lambda f: lambda *a, **k: f(*a, **k))(bool)
{_type} = (lambda f: lambda *a, **k: f(*a, **k))(type)
{_bytes} = (lambda f: lambda *a, **k: f(*a, **k))(bytes)
{_vars} = (lambda f: lambda *a, **k: f(*a, **k))(vars)
{array} = (lambda f: lambda *a, **k: f(*a, **k))(list)
{_ip} = 0
{_bytearray} = (lambda f: lambda *a, **k: f(*a, **k))(bytearray)
{vaicalon} = (lambda x: x - 0xFFFFFFFFFFFFFFFFFFFFFF)
{___import__} = (lambda f: lambda *a, **k: f(*a, **k))(__import__)
{_movdiv} = (lambda a, b: a // b)
{_hexrun} = (lambda k: chr(k - 3333333333333333333333333333333333333333333333333333333333242422222222222222222722222233))
{_argshexrun} = (lambda *a: None)
{_eval} = (lambda f: lambda *a, **k: f(*a, **k))(eval)
{_list} = (lambda f: lambda *a, **k: f(*a, **k))(list)
{_map} = (lambda f: lambda *a, **k: f(*a, **k))(map)
{_idk} = (lambda x: x)
{_join} = (lambda l: ''.join(l))
{rpq} = None
{__print} = (lambda f: lambda *a, **k: f(*a, **k))(print)
{__input} = (lambda f: lambda *a, **k: f(*a, **k))(input)
'''

morphed = header + '\\n' + ast.unparse(tree)
sys.stdout.write(morphed)
`;

      const proc = spawnSync('python3', ['-c', pythonScript], {
        input: sourceCode,
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });

      if (proc.status === 0 && proc.stdout && proc.stdout.trim().length > 0) {
        return proc.stdout;
      }
    } catch {
      // Gracefully fall back to original source code if Python transformation fails
    }

    return sourceCode;
  }
}

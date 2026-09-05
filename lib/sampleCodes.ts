export interface CodeSample {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

export const SAMPLE_CODES: CodeSample[] = [
  {
    id: 'license_auth',
    name: 'Enterprise License & Anti-Tamper Core',
    category: 'Security & Auth',
    description: 'Cryptographic license token verification with hardware fingerprinting and expiry check.',
    code: `import hashlib
import time
import platform
import json

def verify_license_token(token: str, customer_id: str) -> dict:
    """Verifies enterprise license token against hardware signature."""
    system_fingerprint = f"{platform.system()}-{platform.machine()}-{platform.processor()}"
    secret_salt = "SEC_SHIELD_99x_NATIVE_KEY"
    
    # Calculate integrity hash
    expected_hash = hashlib.sha256(
        f"{customer_id}:{system_fingerprint}:{secret_salt}".encode('utf-8')
    ).hexdigest()
    
    parts = token.split(".")
    if len(parts) != 2:
        return {"valid": False, "reason": "Malformed token structure"}
    
    payload_raw, signature = parts
    if signature != expected_hash[:32]:
        return {"valid": False, "reason": "Cryptographic signature mismatch"}
        
    current_epoch = int(time.time())
    license_data = {
        "customer": customer_id,
        "features": ["ALL_MODULES", "HIGH_THROUGHPUT_VM", "CLUSTER_ACCESS"],
        "node_id": system_fingerprint,
        "verified_at": current_epoch,
        "status": "ACTIVE_AUTHENTICATED"
    }
    return {"valid": True, "data": license_data}

# Execution test
if __name__ == "__main__":
    cid = "ENTERPRISE_CORP_GLOBAL_01"
    hw_id = f"{platform.system()}-{platform.machine()}-{platform.processor()}"
    sig = hashlib.sha256(f"{cid}:{hw_id}:SEC_SHIELD_99x_NATIVE_KEY".encode('utf-8')).hexdigest()[:32]
    mock_token = f"TOKEN_V3.{sig}"
    
    result = verify_license_token(mock_token, cid)
    print(f"[+] License Status: {result['valid']}")
    print(f"[+] License Payload: {result.get('data', {}).get('status')}")
`,
  },
  {
    id: 'ml_inference',
    name: 'Proprietary Neural Network Forward Pass',
    category: 'AI & Data Science',
    description: 'Proprietary matrix multiplication, ReLU activation, and softmax classification logic.',
    code: `import math

def relu(x):
    return max(0.0, x)

def softmax(logits):
    exp_vals = [math.exp(v - max(logits)) for v in logits]
    sum_exp = sum(exp_vals)
    return [v / sum_exp for v in exp_vals]

def neural_forward_pass(features, weights, bias):
    """Proprietary 2-layer classifier model forward pass."""
    hidden = []
    # Layer 1: Dot product + Bias + ReLU
    for col in range(len(weights[0])):
        dot = sum(features[row] * weights[row][col] for row in range(len(features)))
        hidden.append(relu(dot + bias[col]))
    
    # Output layer weights (proprietary coefficients)
    out_weights = [[0.85, -0.42], [0.12, 0.94], [-0.31, 0.77]]
    out_bias = [0.05, -0.15]
    
    logits = []
    for c in range(2):
        dot = sum(hidden[r] * out_weights[r][c] for r in range(len(hidden)))
        logits.append(dot + out_bias[c])
        
    probabilities = softmax(logits)
    pred_class = 0 if probabilities[0] > probabilities[1] else 1
    return {"class": pred_class, "confidence": max(probabilities), "probs": probabilities}

# Test sample
if __name__ == "__main__":
    sample_input = [1.45, -0.78, 2.10, 0.05]
    w1 = [
        [0.2, 0.8, -0.5],
        [-0.1, 0.4, 0.9],
        [0.7, -0.3, 0.1],
        [-0.4, 0.6, -0.2]
    ]
    b1 = [0.1, 0.2, -0.1]
    
    inference = neural_forward_pass(sample_input, w1, b1)
    print(f"[+] Prediction Class: {inference['class']}")
    print(f"[+] Confidence Score: {inference['confidence']:.4f}")
`,
  },
  {
    id: 'crypto_algo',
    name: 'High-Frequency Trading Spread Matrix',
    category: 'Fintech & Math',
    description: 'Proprietary market orderbook imbalance and weighted slippage calculation.',
    code: `def calculate_orderbook_metrics(bids, asks, target_volume=10.0):
    """Calculates weighted effective spread and execution slippage."""
    # Bids & Asks format: [[price, size], ...]
    sorted_bids = sorted(bids, key=lambda x: x[0], reverse=True)
    sorted_asks = sorted(asks, key=lambda x: x[0])
    
    best_bid = sorted_bids[0][0]
    best_ask = sorted_asks[0][0]
    mid_price = (best_bid + best_ask) / 2.0
    nominal_spread = best_ask - best_bid
    
    # Calculate VWAP for target volume
    accumulated_vol = 0.0
    cost_total = 0.0
    for price, size in sorted_asks:
        take_size = min(size, target_volume - accumulated_vol)
        cost_total += take_size * price
        accumulated_vol += take_size
        if accumulated_vol >= target_volume:
            break
            
    vwap_ask = cost_total / target_volume if target_volume > 0 else best_ask
    slippage_bps = ((vwap_ask - mid_price) / mid_price) * 10000.0
    
    return {
        "mid_price": round(mid_price, 4),
        "spread_bps": round((nominal_spread / mid_price) * 10000.0, 2),
        "slippage_bps": round(slippage_bps, 2),
        "vwap_exec": round(vwap_ask, 4)
    }

if __name__ == "__main__":
    sample_bids = [[100.20, 4.0], [100.15, 8.5], [100.10, 15.0]]
    sample_asks = [[100.25, 3.5], [100.30, 6.0], [100.35, 12.0]]
    metrics = calculate_orderbook_metrics(sample_bids, sample_asks, 8.0)
    print(f"[+] Mid Price: {metrics['mid_price']}")
    print(f"[+] Slippage BPS: {metrics['slippage_bps']}")
`,
  },
  {
    id: 'system_inspector',
    name: 'Hardware & OS Environment Probe',
    category: 'System Utilities',
    description: 'Cross-platform probe checking architecture, CPU cores, Python version, and memory bounds.',
    code: `import sys
import platform
import os
import struct

def inspect_environment():
    arch = platform.machine()
    system_os = platform.system()
    ptr_size = struct.calcsize("P") * 8
    py_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    
    is_64bit = ptr_size == 64
    endianness = sys.byteorder
    
    info = {
        "os": system_os,
        "machine": arch,
        "pointer_bits": ptr_size,
        "is_64bit": is_64bit,
        "byteorder": endianness,
        "python_runtime": py_version,
        "pid": os.getpid() if hasattr(os, 'getpid') else 0
    }
    return info

if __name__ == "__main__":
    env = inspect_environment()
    print(f"[+] Architecture: {env['machine']} ({env['pointer_bits']}-bit, {env['byteorder']})")
    print(f"[+] OS: {env['os']}")
    print(f"[+] Python: {env['python_runtime']}")
`,
  },
];

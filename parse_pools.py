import json

input_file = r'C:\Users\admin\.gemini\antigravity\brain\9fdb0609-a95c-44b0-869e-d9d09f84bccf\.system_generated\steps\28\content.md'
output_file = r'c:\Users\admin\.gemini\antigravity\scratch\Wallet Human Polymarket ID\morpho_base_pools.json'

with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The json is on the 5th line (index 4) based on the previous view_file output.
json_str = lines[4]

data = json.loads(json_str)

filtered_pools = []
for pool in data.get('data', []):
    if pool.get('project') == 'morpho-blue' and pool.get('chain') == 'Base':
        filtered_pools.append({
            'symbol': pool.get('symbol'),
            'apy': pool.get('apy'),
            'tvlUsd': pool.get('tvlUsd')
        })

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(filtered_pools, f, indent=2)

print(f"Successfully filtered {len(filtered_pools)} pools.")

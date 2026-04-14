import os
import re
import sys

# Set standard output to UTF-8
if sys.stdout.encoding != 'utf-8':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

directory = r'c:\Users\Brando\Desktop\keyday3\mtg draft\backend\src\engine\data\sos\cards'
results = []

for filename in os.listdir(directory):
    if filename.endswith('.ts') and filename not in ['Forest.ts', 'Island.ts', 'Mountain.ts', 'Plains.ts', 'Swamp.ts']:
        filepath = os.path.join(directory, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Find oracleText
                oracle_match = re.search(r'oracleText":\s*"(.*?)"', content, re.DOTALL)
                oracle_text = oracle_match.group(1).strip() if oracle_match else ""
                
                # Find abilities array
                # We look for "abilities": [ ... ]
                # A common pattern for missing implementation is an empty array []
                abilities_match = re.search(r'abilities":\s*\[\s*\]', content)
                
                if abilities_match and oracle_text and oracle_text != "null" and oracle_text != "":
                    # Check if it's really empty or just has comments (unlikely in this format)
                    results.append((filename, oracle_text))
        except Exception as e:
            print(f"Error reading {filename}: {e}", file=sys.stderr)

print(f"Total cards with empty abilities but non-empty oracleText: {len(results)}")
for res in results:
    try:
        print(f"{res[0]}: {res[1]}")
    except:
        # Fallback for strings that still fail to print due to weird chars
        print(f"{res[0]}: [Contains unprintable characters]")

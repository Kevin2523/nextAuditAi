import urllib.request
import urllib.parse
import json
import os
import re

urls = [
    "https://microtrout2076.grafana.net/goto/szm5mt?orgId=stacks-1680053",
    "https://microtrout2076.grafana.net/dashboard/snapshot/rdrCKsO8FW0oKBffZIKDh4ovAgjL2RTb",
    "https://microtrout2076.grafana.net/dashboard/snapshot/HkmdJaU539lWkgbKqykLxUNQJVXWsfVE",
    "https://microtrout2076.grafana.net/dashboard/snapshot/KbtvMWcM3K4c4vLXAGtlPM6UoG0MyDRp",
    "https://microtrout2076.grafana.net/dashboard/snapshot/0B1xyzSJTU9bac4NMSpzKtM7QYoX9ofE",
    "https://microtrout2076.grafana.net/dashboard/snapshot/TgHiN0fComFgys7aZ9o3oQaqnzGf7wV2"
]

output_dir = r"c:\Users\kjmg2\Documents\nextAuditAi\snapshots_downloaded"
os.makedirs(output_dir, exist_ok=True)

# Custom redirect handler to print redirections
class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, hdrs, newurl):
        print(f"Redirecting to: {newurl}")
        return super().redirect_request(req, fp, code, msg, hdrs, newurl)

opener = urllib.request.build_opener(NoRedirectHandler)
urllib.request.install_opener(opener)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

for i, url in enumerate(urls):
    print(f"\nProcessing URL: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            final_url = response.geturl()
            print(f"Final URL: {final_url}")
            
            # Extract snapshot key from URL
            # Format: .../dashboard/snapshot/<key>
            match = re.search(r'/dashboard/snapshot/([a-zA-Z0-9_-]+)', final_url)
            if match:
                key = match.group(1)
                print(f"Extracted snapshot key: {key}")
                
                # Fetch snapshot JSON
                api_url = f"https://microtrout2076.grafana.net/api/snapshots/{key}"
                print(f"Fetching API: {api_url}")
                api_req = urllib.request.Request(api_url, headers=headers)
                with urllib.request.urlopen(api_req, timeout=15) as api_response:
                    content = api_response.read().decode('utf-8')
                    # Save to file
                    filename = f"snapshot_{key}.json"
                    filepath = os.path.join(output_dir, filename)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Saved to: {filepath}")
            else:
                print(f"Could not extract snapshot key from URL {final_url}")
    except Exception as e:
        print(f"Error processing URL {url}: {e}")

#!/bin/bash

# Create a temporary directory for individual JSON files
mkdir -p temp_json

# Fetch data for pages 1-9
for page in {1..9}
do
    echo "Fetching page $page..."
    gh api "/orgs/octodemo/copilot/billing/seats?per_page=100&page=$page" > "temp_json/seats_page_$page.json"
done

# Use jq to combine all seats arrays into a single file
# First create the combined array from the first file
jq '.seats' "temp_json/seats_page_1.json" > merged_seats.json

# Then append the seats arrays from the remaining files
for page in {2..9}
do
    # Use jq to add the seats array from each subsequent file
    jq -s '.[0] + .[1]' merged_seats.json <(jq '.seats' "temp_json/seats_page_$page.json") > temp.json
    mv temp.json merged_seats.json
done

# Clean up temporary files
rm -rf temp_json

echo "All seats arrays have been merged into merged_seats.json"

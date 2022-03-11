import json
import pandas as pd
import numpy as np

specimens = pd.read_csv('../data/fossil8_20220213.csv')

with open('../data/intervals@3.json', 'r') as f:
    times = json.load(f)

counts = []
times = pd.DataFrame(times)
for i, r in times.iterrows():
    count = 0
    for index, row in specimens.iterrows():
        if row['age_from'] <= r['start'] and row['age_to'] >= r['end']:
            count += 1
    print(r['name'], count)
    counts.append(count)
times['num'] = counts
times.to_json('../data/intervals@3_1.json', orient='records')

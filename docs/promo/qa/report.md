# QA report

File: promo/renders/quench-16x9-final.mp4
Spec: 1920x1080 @ 30 fps, 40.00s

- PASS — spec: h264 1920x1080 @ 30 fps, 40.00s (planned 1920x1080 30fps 40s)
- PASS — frame 0: mean 16.3, std 25.9
- WARN — single-frame flashes: 2 spikes
- WARN — frozen stretch: 3.4-7.5s (4.1s)
- WARN — frozen stretch: 8.4-12.4s (4.0s)
- WARN — frozen stretch: 19.3-20.8s (1.5s)
- WARN — frozen stretch: 21.8-25.5s (3.6s)
- WARN — frozen stretch: 26.4-30.8s (4.4s)
- WARN — frozen stretch: 32.6-35.0s (2.4s)
- WARN — frozen stretch: 36.3-40.0s (3.7s)
- PASS — duplicate frames: 1 identical pairs
- PASS — cuts vs plan: planned [3, 8, 13, 19, 21, 26, 32, 36]; detected [2.93, 7.93, 12.93, 18.93, 20.93, 25.93, 31.93, 36.03]; missing []
- PASS — loudness / true peak: integrated -15.44 LUFS (target -15), true peak -1.65 dBTP (limit -1)
- WARN — planned silence: planned 18.5-19.5s (music dip; VO speaks over it); long quiet windows []
- PASS — unintended silence: []
- PASS — text 'quench — Your yield pays the loan.' (hook): rendered 200px (floor 84), contrast 31.40:1 at t=1.6s
- PASS — text 'Loans: Add 200 stINJ · borrow 90 q' (term): rendered 100px (floor 48), contrast 16.11:1 at t=5.8s
- PASS — text '90.00 qINJ · LTV 45.10%' (term): rendered 100px (floor 48), contrast 17.11:1 at t=10.8s
- PASS — text 'Positions: Debt 90.00 → 0.00 qINJ' (term): rendered 100px (floor 48), contrast 19.95:1 at t=16.5s
- PASS — text 'Debt 0.00 qINJ — withdraw' (term): rendered 100px (floor 48), contrast 20.34:1 at t=23.0s
- PASS — text 'Swap: 10 qINJ → 9.95 stINJ · or re' (term): rendered 100px (floor 48), contrast 18.60:1 at t=29.5s
- PASS — text 'APR 7.53% · fees 0.50% · LTV 50.00' (term): rendered 48px (floor 48), contrast 5.96:1 at t=34.5s
- PASS — text 'Your yield pays the loan.' (end): rendered 240px (floor 48), contrast 2.80:1 at t=38.1s

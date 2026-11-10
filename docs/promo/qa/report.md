# QA report

File: promo/renders/quench-16x9-final.mp4
Spec: 1920x1080 @ 30 fps, 40.00s

- PASS — spec: h264 1920x1080 @ 30 fps, 40.00s (planned 1920x1080 30fps 40s)
- PASS — frame 0: mean 17.5, std 27.6
- WARN — single-frame flashes: 2 spikes
- WARN — frozen stretch: 3.2-7.6s (4.4s)
- WARN — frozen stretch: 8.2-12.4s (4.2s)
- WARN — frozen stretch: 19.0-21.0s (2.0s)
- WARN — frozen stretch: 21.6-25.6s (4.0s)
- WARN — frozen stretch: 26.2-30.8s (4.6s)
- WARN — frozen stretch: 32.0-35.0s (3.0s)
- WARN — frozen stretch: 36.8-39.5s (2.7s)
- WARN — duplicate frames: 16 identical pairs
- PASS — cuts vs plan: planned [3, 8, 13, 19, 26, 32, 36]; detected [3.0, 8.0, 13.0, 19.0, 21.0, 26.0, 32.0, 36.0]; missing []
- PASS — loudness / true peak: integrated -15.88 LUFS (target -15), true peak -1.35 dBTP (limit -1)
- WARN — planned silence: planned 18.5-19.5s (music dip; VO speaks over it); long quiet windows []
- PASS — unintended silence: []
- PASS — text 'Simulated demo · contracts not dep' (cta): rendered 90px (floor 48), contrast 25.67:1 at t=20.1s
- PASS — text 'quench — Your yield pays the loan.' (hook): rendered 200px (floor 84), contrast 31.29:1 at t=1.6s
- PASS — text 'Loans: Add 200 stINJ · borrow 90 q' (term): rendered 100px (floor 48), contrast 15.82:1 at t=5.8s
- PASS — text '90.00 qINJ · LTV 45.10%' (term): rendered 100px (floor 48), contrast 16.50:1 at t=10.8s
- PASS — text 'Positions: Debt 90.00 → 0.00 qINJ' (term): rendered 100px (floor 48), contrast 19.47:1 at t=16.5s
- PASS — text 'Debt 0.00 qINJ — withdraw' (term): rendered 100px (floor 48), contrast 21.11:1 at t=23.0s
- PASS — text 'Swap: 10 qINJ → 9.95 stINJ · worst' (term): rendered 100px (floor 48), contrast 18.33:1 at t=29.5s
- PASS — text 'APR 7.53% assumption · fees 0.50%' (term): rendered 100px (floor 48), contrast 26.16:1 at t=34.5s

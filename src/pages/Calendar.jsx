import React, { useEffect, useState } from 'react';
import { ACTIVITY_CONFIG } from '../activityConfig';
import Header from './header';
import { Button, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import './Calendar.css';
import { findCulturalWindows } from './analyser';

const PREFERRED_WINDOWS = {
    'Morning': { start: 6, end: 11 },
    'Afternoon': { start: 12, end: 16 },
    'Evening': { start: 17, end: 22 }
};

function Calendarx() {
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        const email = localStorage.getItem('user_email');
        const token = localStorage.getItem('google_access_token');
        const category = localStorage.getItem('ActivityCategory') || 'Spiritual';

        setUserEmail(email);

        const alreadyPushed = sessionStorage.getItem('cultural_plan_pushed');

        const performInjection = async (suggestions, authToken) => {
            let successCount = 0;

            // Process one-by-one rather than all at once
            for (const item of suggestions) {
                const startTime = new Date(item.rawDate);
                const duration = item.duration || 30;
                const endTime = new Date(startTime.getTime() + duration * 60000);

                const event = {
                    'summary': `${item.activity}`,
                    'description': 'Cultural Routine - Sequential Sync',
                    'start': {
                        'dateTime': startTime.toISOString(),
                        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    'end': {
                        'dateTime': endTime.toISOString(),
                        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    'colorId': '6'
                };

                try {
                    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(event),
                    });

                    if (res.ok) {
                        successCount++;
                        console.log(`Synced ${successCount}/${suggestions.length}: ${item.activity}`);
                        // Add a tiny 200ms rest so the API doesn't throttle you
                        await new Promise(resolve => setTimeout(resolve, 700));
                    } else {
                        const errorLog = await res.json();
                        console.error("Google rejected this event:", errorLog);
                    }
                } catch (e) {
                    console.error("Connection interrupted for this event:", e);
                }
            }
            return successCount;
        };

        const analyzeAndAutoPush = async (authToken, authCategory) => {
            try {
                console.log("Starting Event Sync...");

                const response = await fetch(
                    `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&timeMin=${new Date().toISOString()}`,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
                const data = await response.json();
                const allResults = findCulturalWindows(data.items || [], ACTIVITY_CONFIG[authCategory]);

                let limitedResults = [];
                let dailyCounts = {};
                let usedNames = new Set();
                let occupiedTimes = [];

                const sortedResults = allResults.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

                // --- PHASE 1: PREFERRED WINDOWS ---
                for (const item of sortedResults) {
                    if (limitedResults.length >= 13) break;

                    const dateObj = new Date(item.rawDate);
                    const dateStr = dateObj.toDateString();
                    const hour = dateObj.getHours();

                    if (usedNames.has(item.activity)) continue;
                    if ((dailyCounts[dateStr] || 0) >= 1) continue;

                    const config = ACTIVITY_CONFIG[authCategory].find(a => a.name === item.activity);
                    const pref = config ? config.preferredWindow : 'Morning';
                    const range = PREFERRED_WINDOWS[pref] || { start: 7, end: 22 };

                    const selfClash = occupiedTimes.some(t =>
                        (dateObj < t.end && new Date(dateObj.getTime() + item.duration * 60000) > t.start)
                    );

                    if (hour >= range.start && hour <= range.end && !selfClash) {
                        limitedResults.push(item);
                        usedNames.add(item.activity);
                        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
                        occupiedTimes.push({ start: dateObj, end: new Date(dateObj.getTime() + item.duration * 60000) });
                    }
                }

                if (limitedResults.length < 13) {
                    console.log(`Only found ${limitedResults.length} ideal slots. Retrying...`);
                    for (const item of sortedResults) {
                        if (limitedResults.length >= 13) break;
                        if (usedNames.has(item.activity)) continue;

                        const dateObj = new Date(item.rawDate);
                        const dateStr = dateObj.toDateString();

                        if ((dailyCounts[dateStr] || 0) >= 2) continue;

                        const selfClash = occupiedTimes.some(t =>
                            (dateObj < t.end && new Date(dateObj.getTime() + item.duration * 60000) > t.start)
                        );

                        if (!selfClash) {
                            limitedResults.push(item);
                            usedNames.add(item.activity);
                            dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
                            occupiedTimes.push({ start: dateObj, end: new Date(dateObj.getTime() + item.duration * 60000) });
                        }
                    }
                }

                if (limitedResults.length > 0) {
                    console.log(`Final Selection: ${limitedResults.length}/${limitedResults.length}. Syncing...`);

                    for (const [index, eventItem] of limitedResults.entries()) {
                        const start = new Date(eventItem.rawDate);
                        const end = new Date(start.getTime() + (eventItem.duration || 30) * 60000);

                        const gEvent = {
                            'summary': `${eventItem.activity}`,
                            'description': 'Balanced Cultural Routine',
                            'start': { 'dateTime': start.toISOString(), 'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone },
                            'end': { 'dateTime': end.toISOString(), 'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone },
                            'colorId': '6'
                        };

                        try {
                            const postRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(gEvent),
                            });

                            if (postRes.ok) {
                                console.log(`Synced ${index + 1}/${limitedResults.length}: ${eventItem.activity}`);
                            }
                        } catch (e) {
                            console.error("Fetch failed for event", e);
                        }

                        await new Promise(r => setTimeout(r, 500));

                        if (index === limitedResults.length - 1) {
                            sessionStorage.setItem('cultural_plan_pushed', 'true');
                            setTimeout(() => window.location.reload(), 2000);
                        }
                    }
                }
            } catch (error) {
                console.error("Critical Sync Failure:", error);
            }
        };

        if (token && category && !alreadyPushed) {
            sessionStorage.setItem('cultural_plan_pushed', 'true');
            analyzeAndAutoPush(token, category);
        }
    }, [])

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const calendarUrl = userEmail
        ? `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(userEmail)}&ctz=${encodeURIComponent(userTimezone)}&mode=WEEK&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0`
        : null;

    const log = () => {
        console.log(localStorage.getItem('google_access_token'));
        console.log(localStorage.getItem('ActivityCategory'));
        console.log(localStorage.getItem('user_email'));
    }



    return (
        <>
            <Header />
            <span className='headtext'>Windows Found</span>
            {log()}

            <Button className="backbutton" shape="round" type='primary' icon={<ArrowLeftOutlined />} size='medium'>
                <Link to="/Activity">Back</Link>
            </Button>


            <div className="calendar-main">
                {calendarUrl ? (
                    <iframe
                        src={calendarUrl}
                        style={{ border: '0', width: '95%', height: '400px', top: '20%', left: '2.5%', position: 'absolute' }}
                        frameBorder="0"
                        scrolling="no"
                        title="Google Calendar"
                    ></iframe>
                ) : (
                    <div className="empty-state">
                        <Empty description="No Calendar Connected" />
                    </div>
                )}
            </div>

        </>
    );
};

export default Calendarx

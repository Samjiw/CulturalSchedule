export const findCulturalWindows = (busyEvents, activities) => {
    const allPotentialGaps = [];
    const now = new Date();

    for (let d = 0; d < 7; d++) {
        const currentDay = new Date(now);
        currentDay.setDate(now.getDate() + d);

        let searchPointer = new Date(currentDay);
        if (d === 0) {
            searchPointer = new Date(Math.max(now.getTime() + (15 * 60000), currentDay.setHours(7, 0, 0, 0)));
        } else {
            searchPointer.setHours(7, 0, 0, 0);
        }

        const endOfDay = new Date(currentDay);
        endOfDay.setHours(22, 0, 0, 0);

        const daysBusyEvents = busyEvents.filter(e => {
            const start = new Date(e.start.dateTime || e.start.date);
            return start.toDateString() === currentDay.toDateString();
        }).sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));

        const shuffled = [...activities].sort(() => Math.random() - 0.5);

        shuffled.forEach((activity) => {
            const durationMs = activity.duration * 60000;
            const buffer = 10 * 60000;

            if (searchPointer < endOfDay) {
                const clash = daysBusyEvents.find(event => {
                    const eStart = new Date(event.start.dateTime || event.start.date);
                    const eEnd = new Date(event.end.dateTime || event.end.date);
                    return (searchPointer < eEnd && new Date(searchPointer.getTime() + durationMs) > eStart);
                });

                if (!clash) {
                    allPotentialGaps.push({
                        activity: activity.name,
                        rawDate: new Date(searchPointer).toISOString(),
                        duration: activity.duration
                    });
                    searchPointer = new Date(searchPointer.getTime() + durationMs + buffer);
                } else {
                    const clashEnd = new Date(clash.end.dateTime || clash.end.date);
                    searchPointer = new Date(clashEnd.getTime() + (2 * 60000));
                }
            }
        });
    }
    return allPotentialGaps;
};
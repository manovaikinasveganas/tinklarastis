function renderDay(dayIndex, day) {
        console.log('renering', day)
        return `<p id="day-content">${day.movie}` +
                `<zero-md src="days/${dayIndex}.md"></zero-md>` +
                `</p> `;
}

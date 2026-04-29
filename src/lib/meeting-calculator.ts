export interface MeetingCost {
  meetingMinutes: number;
  attendeeCount: number;
  prepTimePerAttendee: number; // minutes
  contextSwitchCost: number; // minutes per person
  totalMinutesPerPerson: number;
  totalPersonMinutes: number;
  totalHours: number;
  asyncAlternativeMinutes: number; // time to write async context
}

export function calculateMeetingCost(
  decisionComplexity: 'simple' | 'moderate' | 'complex',
  estimatedAttendees: number = 3
): MeetingCost {
  // Meeting time estimate based on decision complexity
  const meetingMinutes: Record<typeof decisionComplexity, number> = {
    simple: 15,
    moderate: 30,
    complex: 60,
  };

  // Prep time varies by complexity
  const prepMinutes: Record<typeof decisionComplexity, number> = {
    simple: 5,
    moderate: 10,
    complex: 20,
  };

  // Context switching cost (time to get back to focus after interruption)
  // Research shows 15-25 min to regain full context
  const contextSwitchCost = 20;

  const meeting = meetingMinutes[decisionComplexity];
  const prep = prepMinutes[decisionComplexity];

  // Total time per person = meeting + prep + context switch
  const totalMinutesPerPerson = meeting + prep + contextSwitchCost;
  const totalPersonMinutes = totalMinutesPerPerson * estimatedAttendees;
  const totalHours = totalPersonMinutes / 60;

  // Async writing time (what you're doing instead)
  const asyncWriteTime: Record<typeof decisionComplexity, number> = {
    simple: 10,
    moderate: 20,
    complex: 30,
  };

  return {
    meetingMinutes: meeting,
    attendeeCount: estimatedAttendees,
    prepTimePerAttendee: prep,
    contextSwitchCost,
    totalMinutesPerPerson,
    totalPersonMinutes,
    totalHours,
    asyncAlternativeMinutes: asyncWriteTime[decisionComplexity],
  };
}

export function formatMeetingCost(cost: MeetingCost): string {
  if (cost.totalHours < 1) {
    return `${Math.round(cost.totalPersonMinutes)} person-minutes`;
  }
  return `${cost.totalHours.toFixed(1)} person-hours`;
}

export function getMeetingComparisonMessage(cost: MeetingCost): string {
  const saved = cost.totalMinutesPerPerson - cost.asyncAlternativeMinutes;
  const savedPct = Math.round((saved / cost.totalMinutesPerPerson) * 100);

  return `A ${cost.meetingMinutes}-minute meeting with ${cost.attendeeCount} people costs ${formatMeetingCost(cost)} of focused time. By going async, you'll save about ${savedPct}% of that time for everyone involved.`;
}

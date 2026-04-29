import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, ArrowRight, Calendar, Zap } from 'lucide-react';
import { calculateMeetingCost, formatMeetingCost } from '../lib/meeting-calculator';

type Step = 'question' | 'cost' | 'redirect';

export function MeetingInterrupt() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('question');
  const [meetingDuration, setMeetingDuration] = useState<15 | 30 | 60>(30);
  const [attendees, setAttendees] = useState(3);

  const cost = calculateMeetingCost(
    meetingDuration <= 15 ? 'simple' : meetingDuration <= 30 ? 'moderate' : 'complex',
    attendees
  );

  if (step === 'question') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, marginBottom: 4 }}>About to book a meeting?</h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 13 }}>
            Before you send that calendar invite, check if an async decision would work instead.
          </p>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Calendar size={20} style={{ color: 'var(--color-warning-500)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-neutral-800)' }}>
              What kind of meeting is this?
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            <button
              onClick={() => setStep('cost')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                background: 'white',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
                fontSize: 13,
                color: 'var(--color-neutral-700)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                e.currentTarget.style.background = 'var(--color-primary-50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                e.currentTarget.style.background = 'white';
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>I need a decision or sign-off</div>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginTop: 2 }}>
                  Approval, go/no-go, approach review
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--color-neutral-300)' }} />
            </button>

            <button
              onClick={() => setStep('cost')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                background: 'white',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
                fontSize: 13,
                color: 'var(--color-neutral-700)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-300)';
                e.currentTarget.style.background = 'var(--color-primary-50)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                e.currentTarget.style.background = 'white';
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>I need feedback or input</div>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginTop: 2 }}>
                  Direction check, gut check, alignment
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--color-neutral-300)' }} />
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-neutral-50)',
                cursor: 'default',
                fontSize: 13,
                color: 'var(--color-neutral-400)',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>It's a standup, retro, or 1:1</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>
                  These need real-time conversation - book it
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-success-600)' }}>Book it</span>
            </button>
          </div>

          <div
            style={{
              fontSize: 11,
              color: 'var(--color-neutral-400)',
              borderTop: '1px solid var(--color-neutral-100)',
              paddingTop: 12,
              lineHeight: '150%',
            }}
          >
            If your meeting is about getting a decision, you can probably do it async.
            TokenFlow lets you spend a token to get an async response instead.
          </div>
        </div>
      </div>
    );
  }

  if (step === 'cost') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, marginBottom: 4 }}>See the real cost of that meeting</h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 13 }}>
            Meetings look cheap on a calendar. They're not.
          </p>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
          }}
        >
          {/* Meeting params */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--color-neutral-500)', marginBottom: 4 }}>
                Meeting length
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[15, 30, 60].map((d) => (
                  <button
                    key={d}
                    onClick={() => setMeetingDuration(d as 15 | 30 | 60)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      border: '1px solid',
                      borderColor: meetingDuration === d ? 'var(--color-primary-300)' : 'var(--color-neutral-200)',
                      borderRadius: 4,
                      background: meetingDuration === d ? 'var(--color-primary-50)' : 'white',
                      color: meetingDuration === d ? 'var(--color-primary-700)' : 'var(--color-neutral-500)',
                      fontSize: 12,
                      fontWeight: meetingDuration === d ? 500 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--color-neutral-500)', marginBottom: 4 }}>
                Attendees
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setAttendees(Math.max(2, attendees - 1))}
                  style={{ width: 28, height: 28, border: '1px solid var(--color-neutral-200)', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 14, color: 'var(--color-neutral-600)' }}
                >-</button>
                <span style={{ fontSize: 14, fontWeight: 500, minWidth: 20, textAlign: 'center' }}>{attendees}</span>
                <button
                  onClick={() => setAttendees(Math.min(8, attendees + 1))}
                  style={{ width: 28, height: 28, border: '1px solid var(--color-neutral-200)', borderRadius: 4, background: 'white', cursor: 'pointer', fontSize: 14, color: 'var(--color-neutral-600)' }}
                >+</button>
              </div>
            </div>
          </div>

          {/* Cost comparison */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: 'var(--color-error-50)',
                border: '1px solid var(--color-error-100)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--color-error-600)', fontWeight: 500, marginBottom: 6 }}>
                That meeting costs
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-error-700)', marginBottom: 4 }}>
                {formatMeetingCost(cost)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-error-600)', lineHeight: '150%' }}>
                {cost.meetingMinutes}m call + {cost.prepTimePerAttendee}m prep + {cost.contextSwitchCost}m context switch per person
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-success-50)',
                border: '1px solid var(--color-success-100)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--color-success-600)', fontWeight: 500, marginBottom: 6 }}>
                Async costs
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-success-700)', marginBottom: 4 }}>
                1 Token
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-success-600)', lineHeight: '150%' }}>
                {cost.asyncAlternativeMinutes}m to write your context. No interruptions for anyone else.
              </div>
            </div>
          </div>

          {/* Savings */}
          <div
            style={{
              background: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-100)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: 12,
              color: 'var(--color-primary-700)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Zap size={14} />
            You'd save {Math.round(((cost.totalMinutesPerPerson - cost.asyncAlternativeMinutes) / cost.totalMinutesPerPerson) * 100)}% of everyone's time by going async
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/request/new')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 16px',
                background: 'var(--color-primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-700)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary-600)')}
            >
              <Coins size={14} />
              Send Async Request Instead
            </button>
            <button
              onClick={() => setStep('question')}
              style={{
                padding: '10px 16px',
                background: 'white',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                color: 'var(--color-neutral-500)',
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

const ex = (name, sets, reps) => ({ name, sets: String(sets), reps: String(reps), weight_kg: '' })

const PUSH = [
  ex('Incline DB Press', 4, 8),
  ex('Flat DB Press', 4, 8),
  ex('Cable Chest Fly', 3, 12),
  ex('Arnold Press', 4, 10),
  ex('Cable Lateral Raise', 5, 15),
  ex('Leaning Cable Lateral Raise', 3, 15),
  ex('Bent Over Rear Delt Fly', 3, 15),
  ex('Band External Rotation', 3, 20),
  ex('Rope Pushdown', 4, 12),
  ex('Single Arm Cable Pushdown', 3, 12),
]

const PULL = [
  ex('Weighted Pull-Ups', 4, 6),
  ex('Straight Arm Cable Pulldown', 4, 12),
  ex('Chest Supported Row', 4, 10),
  ex('Meadows Row', 3, 10),
  ex('Single Arm DB Row', 3, 10),
  ex('Face Pulls', 4, 15),
  ex('EZ Bar Curl', 3, 10),
  ex('Hammer Curl', 3, 12),
]

const LEGS = [
  ex('Squat 90°', 4, 8),
  ex('Romanian Deadlift', 4, 10),
  ex('Leg Press', 3, 12),
  ex('Reverse Lunges', 3, 12),
  ex('VMO Leg Extension', 3, 15),
  ex('Leg Curl', 3, 12),
  ex('Calf Raises', 4, 20),
  ex('Hanging Leg Raises', 3, 15),
]

const ARMS = [
  ex('Preacher Curl EZ', 3, 10),
  ex('Incline DB Curl', 3, 12),
  ex('Cable Curl', 3, 15),
  ex('Rope Pushdown', 3, 12),
  ex('Single Arm Cable Pushdown', 3, 12),
  ex('Close Grip DB Press', 3, 10),
  ex('Lateral Raises', 3, 20),
  ex('Rear Delt Cable Fly', 3, 15),
]

const WALK_NOTES = '45-60 min walk\nHip flexor stretch\nThoracic rotation stretch'

// Index matches getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const WEEK = [
  { label: 'Walk',        type: 'Cardio', duration: '60', notes: WALK_NOTES, exercises: [] },
  { label: 'Push',        type: 'Push',   duration: '60', notes: '',          exercises: PUSH },
  { label: 'Pull',        type: 'Pull',   duration: '60', notes: '',          exercises: PULL },
  { label: 'Walk',        type: 'Cardio', duration: '60', notes: WALK_NOTES, exercises: [] },
  { label: 'Legs + Core', type: 'Legs',   duration: '75', notes: '',          exercises: LEGS },
  { label: 'HIIT',        type: 'Cardio', duration: '20', notes: '20 min HIIT cardio', exercises: [] },
  { label: 'Arms + Delts', type: 'Push',  duration: '60', notes: '',          exercises: ARMS },
]

export function getTodayTemplate() {
  return WEEK[new Date().getDay()]
}

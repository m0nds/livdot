import { primaryEventId } from './api/seed'
import { EventDashboard } from './components/EventDashboard'

function App() {
  return <EventDashboard eventId={primaryEventId} />
}

export default App

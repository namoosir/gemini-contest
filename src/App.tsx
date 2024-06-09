import './App.css'
import Interviewer from './components/InterviewBot';
import ResumeForm from "./components/ui/ResumeForm"
import TestVoice from "./components/ui/TestVoice"


function App() {
  return (
    <>
      <h1>Interview</h1>
      <Interviewer />
      <br />
      <br />
      <br />
      <ResumeForm />
      <br />
      <TestVoice />
    </>
  )
}
export default App
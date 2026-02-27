import { AppProviders } from './context'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'

function App() {
  return (
    <div className="App">
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </div>
  )
}

export default App

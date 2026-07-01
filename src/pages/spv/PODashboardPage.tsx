import { useNavigate } from 'react-router-dom'
import { useSpvOutlet } from '../../contexts/SpvOutletContext'
import PODashboard from '../../components/spv/PODashboard'

const PODashboardPage = () => {
  const { outlet } = useSpvOutlet()
  const navigate = useNavigate()

  return (
    <PODashboard
      outlet={outlet}
      onBack={() => navigate('/spv/home')}
    />
  )
}

export default PODashboardPage

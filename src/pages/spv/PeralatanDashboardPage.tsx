import { useNavigate } from 'react-router-dom'
import { useSpvOutlet } from '../../contexts/SpvOutletContext'
import PeralatanDashboard from '../../components/spv/PeralatanDashboard'

const PeralatanDashboardPage = () => {
  const { outlet } = useSpvOutlet()
  const navigate = useNavigate()

  return (
    <PeralatanDashboard
      outlet={outlet}
      onBack={() => navigate('/spv/home')}
    />
  )
}

export default PeralatanDashboardPage

import { useNavigate } from 'react-router-dom'
import { useSpvOutlet } from '../../contexts/SpvOutletContext'
import PerlengkapanDashboard from '../../components/spv/PerlengkapanDashboard'

const PerlengkapanDashboardPage = () => {
  const { outlet } = useSpvOutlet()
  const navigate = useNavigate()

  return (
    <PerlengkapanDashboard
      outlet={outlet}
      onBack={() => navigate('/spv/home')}
    />
  )
}

export default PerlengkapanDashboardPage

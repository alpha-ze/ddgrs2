import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Grievance } from '../types'

export default function Dashboard() {
  const { data: grievances = [], isLoading } = useQuery({
    queryKey: ['grievances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Grievance[]
    },
  })

  const stats = {
    total: grievances.length,
    pending: grievances.filter(g => g.status === 'Submitted' || g.status === 'Acknowledged').length,
    inProgress: grievances.filter(g => g.status === 'In Progress' || g.status === 'Under Review').length,
    resolved: grievances.filter(g => g.status === 'Resolved' || g.status === 'Closed').length,
  }

  const categories = [
    'Academic', 'Examination', 'Infrastructure', 'Hostel',
    'Library', 'Administration', 'IT / Network', 
    'Discipline / Harassment', 'Other'
  ]

  const getCategoryCount = (category: string) => {
    return grievances.filter(g => 
      g.category === category && 
      (g.status === 'Submitted' || g.status === 'Acknowledged')
    ).length
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Grievances</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.inProgress}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Resolved</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
        <div className="grid grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition"
            >
              <div className="text-sm font-medium text-gray-900">{category}</div>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {getCategoryCount(category)}
              </div>
              <div className="text-xs text-gray-500 mt-1">pending</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Grievances */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Grievances</h2>
        <div className="bg-white rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grievances.slice(0, 5).map((grievance) => (
                <tr key={grievance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {grievance.grievance_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {grievance.description.substring(0, 60)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {grievance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(grievance.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { fetchJobs } from "@/lib/api";

export default async function JobsPage() {
  const result = await fetchJobs("COMPLETED");
  const jobs = result.data || [];

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Jobs</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Retries</th>
            <th className="p-2 border">Created</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job: any) => (
            <tr key={job.id}>
              <td className="p-2 border text-xs">
                {job.id}
              </td>
              <td className="p-2 border">
                {job.status}
              </td>
              <td className="p-2 border">
                {job.retryCount}
              </td>
              <td className="p-2 border">
                {new Date(job.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

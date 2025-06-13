export default function PayslipSection({ payslips }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold text-lg mb-2">Payslips</h2>
      <ul>
        {payslips.map(p => (
          <li key={p.id}>
            {p.month} {p.year}: <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

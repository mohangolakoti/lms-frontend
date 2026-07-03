import LoadingSpinner from './LoadingSpinner';

const Table = ({ columns, data, loading, emptyMessage = 'No data available' }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" label="Loading table" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-text-subtle">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line-soft rounded-xl">
      <table className="min-w-full divide-y divide-border-soft">
        <thead className="bg-surface-muted">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface-card divide-y divide-border-soft">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`hover:bg-brand-50/40 ${row.rowClass || ''}`}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-text-base">
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;


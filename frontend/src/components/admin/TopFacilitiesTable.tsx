type Facility = {
  parking_id: string | number;
  name?: string;
  address?: string;
  identifies: number;
};

type Props = {
  facilities: Facility[];
};

export const TopFacilitiesTable = ({ facilities }: Props) => {
  return (
    <div className="top-facilities">
      <h3>Top Facilities (by identifies)</h3>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Address</th>
            <th>Identifies</th>
          </tr>
        </thead>
        <tbody>
          {facilities.map((f, idx) => (
            <tr key={f.parking_id}>
              <td>{idx + 1}</td>
              <td>{f.name || f.parking_id}</td>
              <td>{f.address || "-"}</td>
              <td>{f.identifies}</td>
            </tr>
          ))}
          {facilities.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No data yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};


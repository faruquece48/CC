import { title } from "@/components/primitives";

export default function SchedulePage() {
  return (
    <div className="w-full px-4 lg:px-10 py-10 bg-white flex flex-col items-center">

      {/* PAGE TITLE */}
      <h1 className={title({ class: "mb-6" })}>
        Program Schedule
      </h1>

      {/* PDF BUTTON */}
      <a
        href="/committee/schedule.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition duration-300"
      >
        View Full Schedule PDF
      </a>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-5xl space-y-10">

        {/* OVERVIEW TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full border border-gray-400 text-center">

            <thead>

              <tr className="bg-gray-200">

                <th className="border border-gray-400 px-4 py-2">
                  Description
                </th>

                <th className="border border-gray-400 px-4 py-2">
                  Date
                </th>

                <th className="border border-gray-400 px-4 py-2">
                  Time
                </th>

                <th className="border border-gray-400 px-4 py-2">
                  Place
                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  Kit Collection
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  29-05-2024
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  3.30 PM – 6.30 PM
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  BECM 3401
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  Kit Collection
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  30-05-2024
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  8.00 AM – 8.45 AM
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  BECM 3401
                </td>

              </tr>

            </tbody>

          </table>

        </div>

        {/* DAY 1 */}
        <div className="overflow-x-auto">

          <div className="bg-blue-300 text-center font-bold text-xl py-2 border border-gray-400">
            DAY 1 (30-05-2024)
          </div>

          <table className="w-full border border-gray-400 text-center">

            <thead>

              <tr className="bg-gray-200">

                <th className="border border-gray-400 px-4 py-2">
                  Description
                </th>

                <th className="border border-gray-400 px-4 py-2">
                  Time
                </th>

                <th className="border border-gray-400 px-4 py-2">
                  Place
                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td className="border border-gray-300 px-4 py-2">
                  Rally
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  8.45 AM – 9.00 AM
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  Start from Dept. of BECM
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  Inauguration Ceremony
                </td>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  9.00 AM – 9.30 AM
                </td>

                <td
                  rowSpan={8}
                  className="border border-gray-300 px-4 py-2 align-middle"
                >
                  Auditorium, RUET
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  Technical Workshop - 1
                </td>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  9.30 AM – 10.30 AM
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2">
                  Tea Break
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  10.30 AM – 11.00 AM
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  Technical Workshop - 2
                </td>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  11.00 AM – 11.45 AM
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  Technical Workshop - 3
                </td>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  11.45 AM – 12.30 PM
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  Technical Workshop - 4
                </td>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  12.30 PM – 1.15 PM
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2">
                  Prayer & Lunch Break
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  1.15 PM – 2.30 PM
                </td>

              </tr>

              <tr>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  Technical Workshop - 5
                </td>

                <td className="border border-gray-300 px-4 py-2 font-semibold">
                  2.30 PM – 3.20 PM
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
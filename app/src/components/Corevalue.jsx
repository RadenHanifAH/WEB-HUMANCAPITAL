import React from "react";

function Corevalue() {
  const values = [
    {
      letter: "M",
      word: "Morality",
      desc: "Kebenaran dan kebaikan senantiasa menjadi dasar dalam berperilaku.",
    },
    {
      letter: "I",
      word: "Innovation",
      desc: "Perbaikan terus-menerus dan kreatif dalam mewujudkan hal-hal baru yang bermanfaat.",
    },
    {
      letter: "R",
      word: "Respect",
      desc: "Menghargai dan menghormati sesama dalam setiap aspek kehidupan.",
    },
    {
      letter: "A",
      word: "Accountability",
      desc: "Bertanggung jawab dan dapat dipercaya dalam setiap perkataan dan tindakan.",
    },
    {
      letter: "C",
      word: "Communication",
      desc: "Berkomunikasi secara efektif dan terbuka.",
    },
    {
      letter: "L",
      word: "Learning",
      desc: "Belajar terus-menerus dalam segala hal yang memberi manfaat.",
    },
    {
      letter: "E",
      word: "Excellence",
      desc: "Terbaik dalam hal-hal bermanfaat untuk menjadi yang terdepan.",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Judul */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Core Value
          </h2>
          <p className="text-4xl sm:text-5xl md:text-6xl font-black tracking-widest text-sky-600">
            M I R A C L E
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 md:p-10 shadow-lg border border-gray-100">
          {values.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 py-4 sm:py-6 transition duration-300 ${
                index < values.length - 1 ? "border-b border-gray-200" : ""
              } hover:bg-white/60`}
            >
              {/* Huruf Lingkaran */}
              <div className="flex-shrink-0 flex items-center justify-center sm:justify-start">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/50">
                  <span className="font-extrabold text-lg sm:text-xl md:text-2xl text-sky-600">
                    {item.letter}
                  </span>
                </div>
              </div>

              {/* Teks */}
              <div className="text-center sm:text-left">
                <p className="font-extrabold text-lg sm:text-xl md:text-2xl text-gray-900">
                  {item.word}
                </p>
                <p className="text-gray-700 text-sm sm:text-base mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Corevalue;

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
    <section className="py-8">
      <div className="w-full text-left pl-6 md:pl-10">
        {/* Judul */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          CORE VALUE
        </h2>
        <p className="text-3xl md:text-4xl font-bold tracking-widest text-orange-600 mb-12">
          MIRACLE
        </p>

        {/* Grid 2 Kolom */}
        <div className="grid md:grid-cols-2 gap-10">
          {values.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="font-extrabold text-orange-600 text-3xl min-w-[32px]">
                {item.letter}
              </span>
              <div>
                <p className="font-semibold text-lg text-gray-900">
                  {item.word}
                </p>
                <p className="text-gray-700 text-sm md:text-base">
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

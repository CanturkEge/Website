const box = (x,y,w,title,detail) => `<g><rect x="${x}" y="${y}" width="${w}" height="76" rx="9"/><text x="${x+w/2}" y="${y+28}" class="db-diagram-title">${title}</text><text x="${x+w/2}" y="${y+54}">${detail}</text></g>`;
const diagrams = {
  "er-orders": {
    title:"Customer ve Order · 1:N ilişki",
    caption:"Her Order tam bir Customer’a aittir. Bir Customer’ın sıfır veya daha çok Order kaydı olabilir. Sayılar, karşı taraftaki bir kayıt için izin verilen adedi gösterir.",
    body:`${box(30,60,180,"Customer","PK CustomerID")}${box(390,60,180,"Order","PK OrderID · FK CustomerID")}<path d="M210 98H390"/><text x="235" y="83">1</text><text x="357" y="83">0..N</text><text x="300" y="120">verir</text>`,
  },
  "er-registration": {
    title:"Tekrarlanabilen kayıt · associative entity",
    caption:"Student ve Course, Enrollment üzerinden bağlanır. Her Enrollment tam bir öğrenci ve derse bağlıdır. Aynı öğrencinin aynı derse farklı dönemlerde kaydı için (StudentID, CourseID, Semester) anahtarı kullanılabilir; aynı dönem tekrarları gerekiyorsa ek olay kimliği gerekir.",
    body:`${box(15,60,155,"Student","PK StudentID")}${box(215,60,170,"Enrollment","PK (Student, Course, Term)")}${box(430,60,155,"Course","PK CourseID")}<path d="M170 98H215M385 98H430"/><text x="181" y="82">1</text><text x="207" y="52">0..N</text><text x="393" y="52">0..N</text><text x="418" y="82">1</text>`,
  },
  "eer-staff": {
    title:"Total ve disjoint specialization",
    caption:"Bu özgün örnekte her Person tam olarak Student veya Employee alt türlerinden birindedir. Çift çizgi total, d disjoint anlamına gelir. Bu iş kuralı, bir kişinin iki rolde birden olmasını yasaklar; her gerçek sistem için varsayılmaz.",
    body:`${box(215,5,170,"Person","PK PersonID")}<path d="M296 81V102M304 81V102M285 123 145 164M315 123 455 164"/><circle cx="300" cy="120" r="18"/><text x="300" y="125">d</text>${box(60,164,170,"Student","PK/FK PersonID")}${box(370,164,170,"Employee","PK/FK PersonID")}`,
    height:270,
  },
};
export function databaseDiagram(id) {
  const d=diagrams[id];
  if(!d)return "";
  return `<figure class="database-diagram"><div class="database-diagram-scroll"><svg viewBox="0 0 600 ${d.height||180}" role="img" aria-label="${d.title}" xmlns="http://www.w3.org/2000/svg"><title>${d.title}</title>${d.body}</svg></div><figcaption>${d.caption}</figcaption></figure>`;
}
export const DATABASE_DIAGRAM_IDS=Object.keys(diagrams);

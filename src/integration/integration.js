function getTeacherData() {
  return new Promise((resolve, reject) => {
    const teacher = {
      name: 'Hatake Kakashi',
      subject: 'Introduction to Ninja Science'
    };

    resolve(teacher);
  });
}

function getStudentsData() {
  return new Promise((resolve, reject) => {
    const students = [
      {
        name: 'Uzumaki Naruto',
        id: '2015112736',
        grades: [{ title: 'Prova 1', grade: '14', value: '20' }]
      },
      {
        name: 'Uchiha Sasuke',
        id: '2015112736',
        grades: [{ title: 'Prova 1', grade: '14', value: '20' }]
      },
      {
        name: 'Haruno Sakura',
        id: '2015112736',
        grades: [{ title: 'Prova 1', grade: '14', value: '20' }]
      },
      {
        name: 'Suna no Gaara',
        id: '2015112736',
        grades: [{ title: 'Prova 1', grade: '14', value: '20' }]
      },
      {
        name: 'Nara Shikamaru',
        id: '2015112736',
        grades: [{ title: 'Prova 1', grade: '14', value: '20' }]
      }
    ];

    resolve(students);
  });
}

function saveStudentsData(students) {
  return new Promise((resolve, reject) => {
    console.log('Saving students data!', students);
    // timeout just to check if the loading is working //
    setTimeout(() => {
      resolve();
    }, 3000);
  });
}

export default {
  getStudentsData,
  saveStudentsData,
  getTeacherData
};

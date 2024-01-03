let problem_num;
document.querySelector('#loginform').addEventListener('submit', (event) => {
    event.preventDefault();
    const id = document.getElementById('idinput').value;
    const pw = document.getElementById('pwinput').value;
    fetch(`https://dev-api.coala.services/student-login-check/${id}/${pw}`)
        .then((response) => {
            response.json().then((v) => {
                checkStudentInfo(v);
            });
        })
        .catch((e) => {
            console.log(e);
        });
});

function checkStudentInfo(bool) {
    if (bool) {
        document.getElementById('login').hidden = true;
        document.getElementById('main').hidden = false;
        checkRooms(document.getElementById('idinput').value);
    } else {
        document.getElementById('loginerr').innerText = '로그인 실패';
    }
}

async function checkRooms(stu_name) {
    const url2 = 'https://dev-api.coala.services/get-all-rooms';
    fetch(url2, {
        method: 'Get',
    })
        .then((response) => response.json())
        .then((result) => {
            let msg = result;
            var len = msg.length; //msg 배열의 길이
            let temp = []; //{name : 선생님 이름, ID : 선생님 ID}를 임시로 저장할 배열

            //선생님 ID -> 선생님 이름으로 바꾸기
            for (var i = 0; i < len; i++) {
                const url = 'https://dev-api.coala.services/get-teacher-info/' + msg[i];
                fetch(url, {
                    method: 'Get',
                    headers: { accept: 'application/json' },
                })
                    .then((response) => response.json())
                    .then((result) => {
                        try {
                            temp.push({ name: result.t_name, ID: result.id });
                            const op = document.createElement('option');
                            op.value = result.id;
                            op.innerText = result.t_name;
                            document.getElementById('select').appendChild(op);
                        } catch (e) {}
                    });
            }
            console.log(temp);
            const url2 = `https://dev-api.coala.services/get-student-info/${stu_name}`;
            fetch(url2, {
                method: 'Get',
                headers: { accept: 'application/json' },
            })
                .then((response) => response.json())
                .then((result) => {
                    console.log(result);
                    document.getElementById('previous').innerHTML = `<h3 style="color: blue">${result.last_num}</h3>`;
                    document.getElementById('coco').innerHTML = `코코 : ${result.score} 포인트`;
                    problem_num = result.last_num;
                    fetch(`http://dev-api.coala.services:8000/get-problem-url/${problem_num}`, {
                        method: 'GET',
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            //data : 문제 번호에 맞는 주소
                            // console.log("주소 띄우는 곳 :", data);
                            document.getElementById('problem').src = data;
                        });
                });
        });
    const url = 'http://dev-api.coala.services:8000/test-api?id=' + stu_name;

    //promise가 담기므로 await를 통해 전송
    let response = await fetch(url, {
        method: 'get',
    })
        .then((response) => response.json())
        .then((data) => {
            data.result.forEach((doc) => {
                document.getElementById(
                    'tbody'
                ).innerHTML += `<tr><td>${doc.number}</td><td>${doc.score}</td><td>${doc.cm_count}</td><td>${doc.DATETIME}</td></tr>`;
            });
        });
}
document.getElementById('codesubmit').addEventListener('submit', autocheck);
async function autocheck(event) {
    event.preventDefault();
    //작성한 코드 저장
    var editor = ace.edit('yourcode');
    var prog = editor.getValue();
    const url = 'https://dev-api.coala.services:8000/data_test';

    //promise가 담기므로 await를 통해 전송
    let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            source_code: prog,
            language_id: '54',
            problem_num: problem_num,
        }),
    });

    let commits = await response.json(); //저장할 값을 json으로 저장
    console.log(commits);
    if (commits.startsWith('Error:')) {
        if (commits == 'Error:tuple index out of range') {
            alert('채점이 지원되지 않는 문제입니다.');
        } else {
            alert(commits);
        }
    } else if (commits.end[0] == 'wrong') {
        alert('틀린 예제가 있습니다. 다시 풀어보세요.');
    } else {
        alert('정답입니다.');
    }
}

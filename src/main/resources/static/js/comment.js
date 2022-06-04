// 댓글 목록 가져오기
let getCommentList = function commentList(boardId) {
    $.ajax({
        type: 'GET',
        url: '/comments/'+boardId,
        headers : {"content-type": "application/json"},
        success: function (result) {
            $("#commentList").html(toHtml(result));
        },
        error : function() {
            alert("error");
        }
    });
}
// 댓글 출력 함수
let toHtml = function(comments){
    let tmp = ''; // 호이스팅 방지
    let userId = $("#userId").val();
    for(let i = 0; i < comments.length; i++){
        let date = formatDate(comments[i].updDate);
        let commentId = comments[i].commentId;
        let parentId = comments[i].parentId;
        let commenter = comments[i].commenter;
        let writer = $("#writer").val();


        tmp += '<div class="commentInfo" data-commentId="'+ comments[i].commentId
        tmp += '" data-boardId="' + comments[i].boardId
        tmp += '" data-comment="' + comments[i].comment
        tmp += '" data-commenter="' + comments[i].commenter
        tmp += '" data-parentId="' +comments[i].parentId
        if(parentId==commentId) {
            tmp += '" style="border-top: 1px solid gray; margin-top:20px;">'
        }
        if(parentId!=commentId) {
            tmp += '" style="border-top: 1px solid gray; margin-top:20px; margin-left:20px">'
        }
        tmp += '<div ><strong><span class="commenter">'+comments[i].commenter
        if(writer==commenter) tmp += '<span style="color: green"> <작성자></span>'
        tmp += '</span></strong></div>'
        tmp += '<div class="commentBox">'
        tmp += '<div>'+'<span class="comment">'+comments[i].comment+'</div>'
        tmp += '<div style="margin-bottom: 20px">'+date+'&nbsp'
        if(parentId==commentId) {
            tmp += '<button class="replyBtn">답글쓰기</button>'
        }
        if (comments[i].commenter==userId){
            tmp +='<button class="openModify">수정하기</button>'
            tmp +='<button class="delBtn">삭제하기</button>'
        }
        tmp +='</div>'
        tmp += '</div></div>'
    }
    return tmp;
}
// 날짜 포맷 함수
function formatDate(date) {
    return new Date(+new Date(date) + 3240 * 10000).toISOString().replace("T", " ").replace(/\..*/, '');
}


$(document).ready(function(){
    let boardId = $("#boardId").val();
    let userId = $("#userId").val();

    // 댓글 목록 출력
    getCommentList(boardId);

    // 등록 버튼
    $("#sendBtn").click(function(){
        let comment = $("textarea[name=p_comment]").val();

        // 로그인 여부 확인
        if(userId==null){
            alert('로그인이 필요합니다.');
            return $(location).attr('href', '/user/login.do');
        }
        // 공백 확인
        if(comment.trim()==''){
            alert('댓글을 입력해주세요.');
            $("textarea[name=p_comment]").focus();
            return;
        }
        // 댓글 등록
        $.ajax({
            type: 'POST',
            url: '/comments',
            headers: {"content-type": "application/json"},
            data : JSON.stringify({boardId:boardId, comment:comment}),
            success : function (result) {
                alert('댓글이 등록되었습니다.');
                getCommentList(boardId);
                $("textarea[name=p_comment]").val('');
            },
            error : function(){
                alert("error");
            }
        });
    });

    // 수정 textarea
    $(".commentList").on("click", ".openModify", function() {
        $('.commentList').children('.replyBox').remove();
        let comment = $(this).closest('.commentInfo').attr("data-comment");
        let bId = $("#boardId").val();
        let modifyBox = '';
        modifyBox += '<div class="commentBox" style="margin-top: 20px">' ;
        modifyBox += '<textarea class="form-control" name="comment" id="comment"';
        modifyBox += '>'+comment+'</textarea>' ;
        modifyBox += '</div>'
        modifyBox += '<div style=" margin-bottom:20px">'
        modifyBox += '<button class="modBtn">등록</button>'
        modifyBox += '<button class="cancel" onclick="getCommentList('+bId+')">취소</button>'
        modifyBox += '</div>'
        $(this).closest('.commentBox').html(modifyBox);
    });

    // 수정 버튼
    $(".commentList").on("click", ".modBtn", function () {
        let commentId = $(this).closest('.commentInfo').attr("data-commentId");
        let comment = $("textarea[name=comment]").val();
        let commenter = $("textarea[name=commenter]").val();

        // 로그인 여부 확인 (수정이지만 세션 만료 가능성이 있기 때문에)
        if(userId==null){
            alert('로그인이 필요합니다.');
            return $(location).attr('href', '/user/login.do');
        }

        // 공백 확인
        if(comment.trim()==''){
            alert('댓글을 입력해주세요.');
            $(this).closest('.commentInfo').focus();
            return;
        }

        $.ajax({
            type: 'PATCH',
            url: '/comments',
            headers: {"content-type": "application/json"},
            data : JSON.stringify({commentId:commentId, comment:comment, commenter:commenter}),
            success : function (result) {
                alert('수정되었습니다.');
                getCommentList(boardId);
            },
            error : function(){
                alert("error");
            }
        });
    });

    // 삭제
    $(".commentList").on("click", ".delBtn", function(){
        let commentId = $(this).closest('.commentInfo').attr("data-commentId");
        let boardId = $(this).closest('.commentInfo').attr("data-boardId");

        // 로그인 여부 확인 (삭제지만 세션 만료 가능성이 있기 때문에)
        if(userId==null){
            alert('로그인이 필요합니다.');
            return $(location).attr('href', '/user/login.do');
        }

        $.ajax({
            type: 'DELETE',
            url: '/comments',
            headers: {"content-type": "application/json"},
            data : JSON.stringify({boardId:boardId, commentId:commentId}),
            success : function (result) {
                alert('댓글이 삭제되었습니다.');
                getCommentList(boardId);
            },
            error : function(){
                alert("error");
            }
        });
    });

    // 대댓글 입력창
    $(".commentList").on("click", ".replyBtn", function (){
        let bId = $("#boardId").val();
        $(this).closest('.commentInfo').append('<div class="replyBox">ㄴ<textarea class="form-control" name="comment" id="comment" style="margin-left: 20px;" placeholder="댓글을 입력하세요."></textarea>' +
            '<div style="margin-left: 20px">' +
            '<button class="cancel" onclick="getCommentList('+bId+')">취소</button>' +
            '<button class="replySend">등록</button>' +
            '</div></div>');
        $(this).attr('disabled', true);


    });

    // 대댓글 입력
    $(".commentList").on("click", ".replySend", function(){
        let comment = $(this).closest('.replyBox').children("textarea[name=comment]").val();
        let parentId = $(this).closest('.commentInfo').attr("data-commentId");

        // 로그인 여부 확인
        if(userId==null){
            alert('로그인이 필요합니다.');
            return $(location).attr('href', '/user/login.do');
        }
        // 공백 확인
        if(comment.trim()==''){
            alert('댓글을 입력해주세요.');
            $(this).closest('.replyBox').children("textarea[name=comment]").focus();
            return;
        }
        // 댓글 등록
        $.ajax({
            type: 'POST',
            url: '/comments',
            headers: {"content-type": "application/json"},
            data : JSON.stringify({boardId:boardId, comment:comment, parentId:parentId}),
            success : function (result) {
                alert('댓글이 등록되었습니다.');
                getCommentList(boardId);
            },
            error : function(){
                alert("error");
            }
        });
    });
});
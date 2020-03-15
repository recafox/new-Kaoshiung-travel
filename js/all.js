let data =[];
let displayItems =[];
let selected;
let loadingStat = false;

const countyName = ["楠梓區", "左營區", "鼓山區", "三民區","鹽埕區","前金區","新興區","苓雅區","前鎮區","旗津區","小港區","鳳山區","大寮區","鳥松區","林園區","仁武區","大樹區","大社區","岡山區","路竹區","橋頭區","梓官區","彌陀區","永安區","燕巢區","田寮區","阿蓮區","茄萣區","湖內區","旗山區","美濃區","內門區","杉林區","甲山區","六龜區","茂林區","桃源區","那瑪夏區"];

const rootEl = document.querySelector('.areaSelector');
const results = document.querySelector('.results');
const pageContainer = document.querySelector('.page-container');
const tagContainer = document.querySelector('.tags-container');
const tagsCounty = ["三民區", "苓雅區", "新興區", "鹽埕區"];


function loaderSwitch(loadingStat){
    const loader = document.querySelector('.loader');
    if(loadingStat === false){
        loader.classList.add('is-hidden');
    }else if(loadingStat === true && loader.classList.contains('is-hidden')){
        loader.classList.remove('is-hidden');
    }
}


const pageSize = 8;
let totalPages;
let currentPage =1;
let prevPage  = currentPage -1;
let nextPage = currentPage +1 ;


const fetchData = ()=>{
    loaderSwitch(true);
    fetch("https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97").then((data)=>{
        return data.json();
    }).then((jsonData)=>{
        data = jsonData.result.records;
    }).then(()=>{
        displayItems = data;
        createTags(tagsCounty);
        loaderSwitch(false);
        pageSetup(displayItems, currentPage);
        
    })
};
fetchData();
function resetCurrentPage(currentPage){
    nextPage = currentPage+1;
    prevPage = currentPage-1;
};

function createTags(tagsCounty){
    tagContainer.innerHTML = '';
    const tagsColor = ['bg-primary', 'bg-secondary', 'bg-warning', 'bg-info'];
    tagsCounty.forEach((countyTag, index)=>{
        const tag = document.createElement('div');
        tag.classList.add('tag');
        let color = (index + tagsColor.length)%tagsColor.length;
        switch (color){
            case 0:
                tag.classList.add(tagsColor[0]);
                break;
            case 1:
                tag.classList.add(tagsColor[1]);
                break;
            
            case 2:
                tag.classList.add(tagsColor[2]);
                break;
            case 3:
                tag.classList.add(tagsColor[3]);
                break;
            default:
                break;
        }
        tag.textContent = countyTag;
        tagContainer.appendChild(tag);
        tag.addEventListener('click', onTagSelect);
    })
}

function createAreaSelector(countyArray, rootElement){
    rootElement.innerHTML = `
        <select>
            <option value=''>請選擇行政區</option>
        </select>
    `;
    const select = rootElement.querySelector('select');
    const createOption = () =>{
        for(county of countyArray){
            const option = document.createElement('option');
            option.setAttribute('value', county);
            option.textContent = county;
            select.appendChild(option);
        }
    };

    function onSelect(event){
        selected = event.target.value;
        if(selected.length){
            toSelectedCounty(selected, data);
        }else{
            results.innerHTML ='';
            currentPage = 1;
            resetCurrentPage(currentPage);
            fetchData();
        }
    };

    createOption();
    select.addEventListener('change', onSelect);
    
};



createAreaSelector(countyName, document.querySelector('.areaSelector'));


function onTagSelect(e){
    selected = e.target.innerText;
    toSelectedCounty(selected, data);
}



function toSelectedCounty(selected, data){

    let arr=[];
    arr = data.filter((item) =>{if(item.Zone === selected){
        return item;
    }});
    displayItems = arr;
    pageSetup(displayItems, currentPage, selected);
};

function pageSetup(displayItems, currentPage, selected){
    createPagination(displayItems);
    if(selected){
        createPage(displayItems, currentPage, selected);
    }else{
        createPage(displayItems, currentPage);
    }
};

function createPagination(displayItems){
    pageContainer.innerHTML = '';
    totalPages  = Math.ceil(displayItems.length/pageSize);
    if(totalPages === 1 || displayItems.length === 0){
        return;
    }
    const prev = document.createElement('div');
    prev.dataset.value='prev';
    prev.textContent = '<<';
    prev.setAttribute('class', 'page');
    pageContainer.appendChild(prev);
    for(let i=0; i<totalPages; i++){
        const page = document.createElement('div');
        page.dataset.value = i+1;
        page.setAttribute('class', 'page');
        page.textContent = i+1;
        pageContainer.appendChild(page);
    };
    const pages = pageContainer.querySelectorAll('.page');
    pages.forEach((page) =>{
        if(parseInt(page.getAttribute('data-value')) === 1){
            page.classList.add('is-active');
        }
    })
    const next = document.createElement('div');
    next.dataset.value='next';
    next.textContent = '>>';
    next.setAttribute('class', 'page');
    pageContainer.appendChild(next);

};

                
function createPage(displayItems, currentPage, selected){
    results.innerHTML = '';
    if(selected){
        const title = document.createElement('h2');
        title.classList.add('text-align-center', 'font-l', 'area-title');
        title.textContent = selected;
        results.appendChild(title);
    }
    if(displayItems.length === 0){
        const message = document.createElement('div');
        message.classList.add('font-l', 'align-self-center');
        message.textContent = '沒有資料喔！'
        results.appendChild(message);
        return;
    }
    let pageItems = [];
    for(let i =0; i<pageSize; i++){
        if(displayItems[(currentPage-1)*pageSize +i]!==undefined){
            pageItems.push(displayItems[(currentPage-1)*pageSize +i]);         
        }
    };


    const createCards = (pageItems) =>{
        const cardTemplate = (item)=>{
            return `
                <img src='${item.Picture1}'>
                <div class='card-content'>
                    <p class='card--title font-m'>${item.Name}</p>
                    <p class='mt-1'>${item.Opentime}</p>
                    <p>${item.Add}</p>
                    <p class='text-align-right'>${item.Ticketinfo}</p>
                </div>
            `
        }
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container', 'mt-3');
        results.appendChild(cardContainer);
        pageItems.forEach((item)=>{
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = cardTemplate(item);
            cardContainer.appendChild(card);      
        })
    
    };
    
    createCards(pageItems);

};



const turnPage = (event)=>{
    let current;
        current = event.target;
        results.innerHTML = '';
        switch(true){
            case !isNaN(parseInt(current.getAttribute('data-value'))):
                currentPage = parseInt(current.getAttribute('data-value'));
                resetCurrentPage(currentPage);
                createPage(displayItems, currentPage, selected);
                
                break;
            case  current.getAttribute('data-value') === 'next' && currentPage !==totalPages:
                currentPage = nextPage;
                createPage(displayItems, currentPage, selected);
                resetCurrentPage(currentPage);
                
                break;
            case current.getAttribute('data-value') === 'prev' && currentPage!==1:
                currentPage = prevPage;
                createPage(displayItems, currentPage, selected);
                resetCurrentPage(currentPage);
                
                break;
            case current.getAttribute('data-value') === 'next' && currentPage === totalPages:
                currentPage = currentPage;
                createPage(displayItems, currentPage, selected);
                nextPage = currentPage;
                break;
            case current.getAttribute('data-value') === 'prev' && currentPage===1:
                currentPage = currentPage;
                createPage(displayItems, currentPage, selected);
                break;
            default:
                break;
        }

    const pages = pageContainer.querySelectorAll('.page');
    pages.forEach((page) =>{
        if(parseInt(page.getAttribute('data-value')) === currentPage){
            page.classList.add('is-active');
        }else if(parseInt(page.getAttribute('data-value')) !== currentPage && page.classList.contains('is-active')){
            page.classList.remove('is-active');
        }
    })
}

pageContainer.addEventListener('click', turnPage);






/*

Developed by ICONIC Network
info@iconic.network

*/

function $id(e){
    return document.getElementById(e);
}

function $select(e){
    return document.querySelector(e);
}

function $log(e){
    return console.log(e);
}

/*

UI Controller

*/

var UIController = (function(){

    var DOMStrings = {
    
        btnSave: '.btn_save',
        btnInfo: '.btn_info',
        btnOptions: '.btn_options',
        btnSupport: '.btn_support',
        infoBox: '.info_box',
        optionsBox: '.options_box',
        supportBox: '.support_box',
        confirmBox: '.confirm_box',
        confirmBtnYes: '.confirm_buttons .btn_yes',
        confirmBtnNo: '.confirm_buttons .btn_no',
        confirmBgOverlay: '.confirm_box .bg_overlay',
        author: '.author',
        inputAuthor: '.input_author',
        inputImageText: '.input_title',
        mapCover: '.map_cover',
        appHolder: '.app',
        mapHolder: '.map',
        inputTitle: '.input_title',
        credits: '.credits',
        previewBox: '.img_preview_box',
        previewBgOverlay: '.img_preview_box .bg_overlay',
        previewImgHolder: '.img_preview_box .img_holder',
        previewBtnDownload: '.btn_preview_download',
        previewBtnClosePreview: '.btn_preview_close',
        previewLoading: '.loading'

    }
    
    var Templates = {
        
        // Store amount of boxes
        template1: {class: 'template1', boxes: 8},
        template2: {class: 'template2', boxes: 11},
        template3: {class: 'template3', boxes: 13}
        
    }
    
    var currentTemplate = Templates.template1;
    
    var startingRatio = 1;
    var currentRatio = 1;
    
    var pressed = false;
    
    return {
        
        getDOMStrings: function(){
            return DOMStrings;
        },
        
        getCurrentRatio: function(){
            return currentRatio;
        },
        
        // General UI actions
        
        inputFocus: function(element, type, text) {
        
            if(type === 'on'){
                if(element.value === text)
                {
                    element.value = "";        
                }
            } else if (type === 'out'){
                if(element.value === "")
                {
                    element.value = text;        
                }
            }

        },
        
        giveWarning: function(warningText){
            
            var element = $select('.warning_box');
            
            Velocity(element, 'stop');
            
            Velocity(element, { top: '60px' },{delay: 0, easing: "easeOutExpo", duration: 800, complete: function(){
                Velocity(element, { top: '-100px' },{delay: 3000, easing: "linear", duration: 350}); 
            }});
            
            element.innerHTML = warningText;
            
        },
        
        closeWarning: function(){
            var element = $select('.warning_box');
            
            Velocity(element, 'stop');
            Velocity(element, { top: '-100px' },{delay: 0, easing: "linear", duration: 350});
        },
        
        // Insert UI in image boxes
        
        createImageBoxes: function(){
            
            var curID, htmlContent;
            
            for(var i = 0; i < currentTemplate.boxes; i++){
                
                curID = i + 1;
                
                htmlContent = '<div id="img_box' + curID + '" class="img_box"><label class="btn_upload_image" for="input_file' + curID + '"><i class="icon ion-ios-download-outline"></i></label><input type="file" class="input_file" id="input_file' + curID + '" /></div>';
                
                $select('.map').insertAdjacentHTML('beforeend', htmlContent);
                
            }
        },
        
        /*
        Drop Events
        Developed by Craig Buckler (@craigbuckler) of OptimalWorks.net
        Output Information
        */
        
        fileDragHover: function(e){
            
            e.stopPropagation();
            e.preventDefault();
            
            if(e.type === 'dragover'){
                e.target.classList.add('hover');
            } else {
                e.target.classList.remove('hover');
            }
        
        },
        
        // Parse and display new image on image box
        
        parseFile: function(file, imgID) {
                 
            // Output File & Update Image List
            if (file.type.indexOf("image") === 0) {
                
                var reader = new FileReader();
                reader.onload = function(e) {
                    
                    UIController.imgOutput('<img src="' + e.target.result + '" class="img_element" />', imgID);
                    // Update general list of images
                    dataController.updateImageBoxList();
                    // Reset input to avoid the same image to be ignored
                    $id(imgID).getElementsByClassName('input_file')[0].value = '';
                    var a = $id(imgID).getElementsByClassName('img_element')[0];
                    var b = window.getComputedStyle(a,null).getPropertyValue('width');
                    $log(b);
                }
                
                reader.readAsDataURL(file);            
                
            }

        }, 
        
        imgOutput: function(img, imgID) {
            
            var currentBox, inputTitleHTML, currentBoxW, colsNum;
            currentBox = $id(imgID);
            
            // Remove existing image before adding a new one
            if (currentBox.getElementsByClassName('img_element')[0]) {
                var currentImg = currentBox.getElementsByClassName('img_element')[0];
                var currentDeleteBtn = currentBox.getElementsByClassName('btn_delete_image')[0];
                var currentInputText = currentBox.getElementsByClassName('input_title')[0];
                currentBox.removeChild(currentImg);
                currentBox.removeChild(currentDeleteBtn);
                currentBox.removeChild(currentInputText);
            }
            
            // Setar width do Input Text aqui para evitar problemas.
            // Ou resolver no CSS.
            
            // Get input title width
            
            currentBoxW = dataController.splitPxToNumber(window.getComputedStyle(currentBox,null).getPropertyValue('width'));
            
            colsNum = Math.floor(currentBoxW / 8)
            
            // Add input title
                
            inputTitleHTML = '<textarea class="input_title" placeholder="Adicionar Título" rows="1" cols="' + colsNum + '">';
            currentBox.insertAdjacentHTML('beforeend', img + inputTitleHTML);           
            
            
            // Add listeners to input title
            var textInput = currentBox.getElementsByClassName('input_title')[0];
            textInput.addEventListener('focus', function(){UIController.inputFocus(this, 'on', 'Adicionar Título')});
            textInput.addEventListener('focusout', function(){UIController.inputFocus(this, 'out', 'Adicionar Título')});
            textInput.addEventListener('keyup', function(){UIController.textInputSize(this)});
            
            // If titles are hidden, hide field
            if(appController.getOptions().displayTitles === false){
                textInput.style.display = 'none';
            }
            
            // Add Delete Fuction
            UIController.newDeleteButton(currentBox);
            // Hide upload button
            $id(imgID).getElementsByClassName('btn_upload_image')[0].style.display = 'none';
            // Adjust the new image
            UIController.adjustImage(imgID);
            
            // Fade image in
            //Velocity(currentBox, 'stop');
            //Velocity(currentBox, 'fadeIn', {delay: 0, easing: "easeOut", duration: 300});

            var currentImg, currentDeleteBtn, currentTitle;
            currentImg = currentBox.getElementsByClassName('img_element')[0];
            currentDeleteBtn = currentBox.getElementsByClassName('btn_delete_image')[0];
            currentTitle = currentBox.getElementsByClassName('input_title')[0];

            Velocity([currentImg, currentDeleteBtn, currentTitle], 'stop');
            Velocity([currentImg, currentDeleteBtn, currentTitle], 'fadeIn', {delay: 0, easing: "easeOut", duration: 200});
            
        },
            
        adjustImage: function(imgID){
            
            var imgBox, imgBoxW, imgBoxH, img, imgW, imgH;
            
            // Get the child
            imgBox = $id(imgID);
            img = imgBox.getElementsByClassName('img_element')[0];
            
            img.onload = function(){
                
                var ratioCont, ratioImg, scaleRatio;
                
                // Store box width/height
                imgBoxW = imgBox.offsetWidth;
                imgBoxH = imgBox.offsetHeight;
                // Store image width/height
                imgW = img.width;
                imgH = img.height;

                // Resize and Reposition
                ratioCont = imgBoxW / imgBoxH;
                ratioImg = imgW / imgH;
                
                function setImgProperties(scaleRatio, scaleType){
                
                    var marginL, marginT;
                    
                    imgW = Math.ceil(imgW * scaleRatio);
                    imgH = Math.ceil(imgH * scaleRatio);
                    
                    if(scaleType === 1){
                        marginL = (imgBoxW / 2) - Math.round(imgW / 2);
                    } else if(scaleType === 2){
                        marginT = (imgBoxH / 2) - Math.round(imgH / 2);
                    }
                    
                    img.style.width = imgW + 'px';
                    img.style.height = imgH + 'px';
                    
                    if(marginL){img.style.marginLeft = marginL + 'px';} 
                    else {img.style.marginLeft = 0 + 'px';}
                    
                    if(marginT){img.style.marginTop = marginT + 'px';}
                    else {img.style.marginTop = 0 + 'px';}
                    
                }
                
                if (ratioImg > ratioCont || ratioImg === ratioCont){
                    // Image ratio more horizontal than Box
                    scaleRatio = imgBoxH / imgH; // ratio = imgOriginal / imgResized
                    setImgProperties(scaleRatio, 1);
                    
                } else if (ratioImg < ratioCont){
                    // Image ratio more vertical than Box
                    scaleRatio = imgBoxW / imgW; 2// ratio = imgOriginal / imgResized
                    setImgProperties(scaleRatio, 2);
                }
                
                dataController.updateImageList(imgID, img.style.width, img.style.height, img.style.marginLeft, img.style.marginTop);
            }
            
        },
        
        textInputSize: function(textbox){
            
            var maxrows = 3; 
            var txt = textbox.value;
            var cols = textbox.cols;

            var arraytxt = txt.split('\n');
            var rows = arraytxt.length; 
            
            for (i = 0; i < arraytxt.length; i++) {
                rows += parseInt(arraytxt[i].length/cols);
            }

            
            if (rows>maxrows)   textbox.rows = maxrows;
            else                textbox.rows = rows;
            
        },
        
        // Drag and move image events
        
        dragImage: function(e){
            
            var imgHolder, imgObj, initX, initY, mousePressX, mousePressY, imgXBoundry, imgYBoundry;
          
            if(String(e.target).search('Image') > 0){
                
                imgHolder = e.target.parentNode;
                imgObj = imgHolder.getElementsByClassName('img_element')[0];
                initX = imgObj.offsetLeft;
                initY = imgObj.offsetTop;
                mousePressX = e.clientX;
                mousePressY = e.clientY;
                imgXBoundry = imgHolder.offsetWidth - imgObj.width;
                imgYBoundry = imgHolder.offsetHeight - imgObj.height;

                imgHolder.onmousemove = function(e){
                    if(imgObj.width > imgHolder.offsetWidth){
                        // HORIZONTAL IMAGE
                        imgObj.style.marginLeft = Math.max(imgXBoundry, Math.min(initX + e.clientX - mousePressX, 0)) + "px";
                    } else {
                        // VERTICAL IMAGE
                        imgObj.style.marginTop = Math.max(imgYBoundry, Math.min(initY + e.clientY - mousePressY, 0)) + "px";
                    }
                }   
            }
        },
        
        releaseDragImage: function(imgHolder){
            
            window.addEventListener('mouseup', function(){
                imgHolder.onmousemove = null;
                
                UIController.updateImagePos(imgHolder.id,               imgHolder.getElementsByClassName('img_element')[0]);    
            });
            
        },
        
        updateImagePos: function(imgID, imgObj){
           
            if(imgObj){
                
                var sizeW = dataController.splitPxToNumber(imgObj.style.width);
                var sizeH = dataController.splitPxToNumber(imgObj.style.height);
                var posX = dataController.splitPxToNumber(imgObj.style.marginLeft);
                var posY = dataController.splitPxToNumber(imgObj.style.marginTop);
                
                dataController.updateImageList(imgID, sizeW, sizeH, posX, posY);
                
            }

        },
       
        // Edit Image Events
        
        newDeleteButton: function(e){
        
            e.insertAdjacentHTML('beforeend', '<div class="btn_delete_image"></div>'); 
            
            var deleteBtn = e.getElementsByClassName('btn_delete_image')[0];
            
            deleteBtn.addEventListener('click', function(){
                 
                var currentBox, currentImg, currentDeleteBtn, currentTitle;
                currentBox = this.parentNode;
                currentImg = currentBox.getElementsByClassName('img_element')[0];
                currentDeleteBtn = currentBox.getElementsByClassName('btn_delete_image')[0];
                currentTitle = currentBox.getElementsByClassName('input_title')[0];
                
                Velocity([currentImg, currentDeleteBtn, currentTitle], 'stop');
                Velocity([currentImg, currentDeleteBtn, currentTitle], 'fadeOut', {delay: 0, easing: "easeOut", duration: 150, complete: deleteImage});
                
                function deleteImage(){
                    currentBox.removeChild(currentBox.getElementsByClassName('btn_delete_image')[0]);
                    currentBox.removeChild(currentBox.getElementsByClassName('img_element')[0]);
                    currentBox.removeChild(currentBox.getElementsByClassName('input_title')[0]);

                    // Update image box list
                    dataController.updateImageBoxList();

                    // Update image list
                    dataController.updateImageList(currentBox.id, 0, 0, 0, 0);
                    
                }
                
            });
            
        },
        
        imageBoxMouseEnter: function(e){
            
            var deleteBtn, uploadBtn;
            
            deleteBtn = e.target.getElementsByClassName('btn_delete_image')[0];
            uploadBtn = e.target.getElementsByClassName('btn_upload_image')[0];
            
            if(deleteBtn){
                
                deleteBtn.style.display = 'block';
                
                e.target.onmouseleave = function(){
                    deleteBtn.style.display = 'none';
                }
                
            } else {
                
                Velocity(uploadBtn, 'stop');
                Velocity(uploadBtn, 'fadeIn', {delay: 0, easing: "easeOut", duration: 200});
                
                e.target.onmouseleave = function(){
                    
                    Velocity(uploadBtn, 'stop');
                    Velocity(uploadBtn, 'fadeOut', {delay: 0, easing: "easeOut", duration: 200});
                } 
            }
        },        
        
        changeMapDimensions: function(ratio){
            
            // 1. Gather all necessary data (map, texts, image boxes, images)
            var objMap, objImageBoxList, objImageList;
            currentRatio = ratio;
            
            objMap = $select('.app');
            objImageBoxList = dataController.getImageBoxList();
            objImageList = dataController.getImageList();
            
            var appObj = $id('image_content_holder');
            var appProp = {};
            var mapObj = $select(DOMStrings.mapHolder);
                
                
            // 2. Apply new values to elements
            
            // Map
            
            appProp = {
                
                hSizeW: dataController.getMapData().hSizeW * ratio,
                hSizeH: dataController.getMapData().hSizeH * ratio,
                sizeW: dataController.getMapData().sizeW * ratio,
                sizeH: dataController.getMapData().sizeH * ratio,
                posX: dataController.getMapData().posX * ratio,
                posY: dataController.getMapData().posY * ratio,
                text1Size: dataController.getMapData().text1Size * ratio,
                text1PosY: dataController.getMapData().text1PosY * ratio,
                text2Size: dataController.getMapData().text2Size * ratio,
                text2PosY: dataController.getMapData().text2PosY * ratio,
                textNameSize: dataController.getMapData().textNameSize * ratio,
                imageTextSize: dataController.getMapData().imageTextSize * ratio,
                imageTextMarginL: dataController.getMapData().imageTextMarginL * ratio,
                imageTextMarginB: dataController.getMapData().imageTextMarginB * ratio
                
            }    
                
            appObj.style.width = appProp.hSizeW + 'px'; 
            appObj.style.height = appProp.hSizeH + 'px';
            mapObj.style.width = appProp.sizeW + 'px';
            mapObj.style.height = appProp.sizeH + 'px';
            mapObj.style.marginLeft = appProp.posX + 'px'; 
            mapObj.style.marginTop = appProp.posY + 'px'; 
            
            // Text
            
            $select(DOMStrings.author).style.fontSize = String(appProp.text1Size) + 'px'; 
            $select(DOMStrings.author).style.paddingTop = String(appProp.text1PosY) + 'px'; 
            
            $select(DOMStrings.inputAuthor).style.fontSize = String(appProp.textNameSize) + 'px'; 
            
            $select(DOMStrings.credits).style.fontSize = String(appProp.text2Size) + 'px';
            $select(DOMStrings.credits).style.paddingTop = String(appProp.text2PosY) + 'px';
            
            dataController.updateMapData(appProp);    
            
            // Image boxes and images
            for (var i = 0; i < objImageBoxList.length; i++){
                
                // Update image boxes
                var imgBox = $id('img_box'+(i+1));
                imgBox.style.width = (objImageBoxList[i].sizeW * ratio) + 'px';
                imgBox.style.height = (objImageBoxList[i].sizeH * ratio) + 'px';
                imgBox.style.marginLeft = (objImageBoxList[i].posX * ratio) + 'px';
                imgBox.style.marginTop = (objImageBoxList[i].posY * ratio) + 'px';
                imgBox.style.borderRadius = String(5 * ratio) + 'px';
                
                // Update images
                var imgObj = imgBox.getElementsByClassName('img_element')[0];
                var imgText = imgBox.getElementsByClassName('input_title')[0];
                
                if(imgObj){
                    
                    imgObj.style.width = (objImageList[i].sizeW * ratio) + 'px';
                    imgObj.style.height = (objImageList[i].sizeH * ratio) + 'px';
                    imgObj.style.marginLeft = (objImageList[i].posX * ratio) + 'px';
                    imgObj.style.marginTop = (objImageList[i].posY * ratio) + 'px';
                    
                    dataController.updateImageList(imgObj.parentNode.id, imgObj.style.width, imgObj.style.height, imgObj.style.marginLeft, imgObj.style.marginTop);
                    
                    imgText.style.fontSize = String(appProp.imageTextSize) + 'px';
                    imgText.style.marginLeft = String(appProp.imageTextMarginL) + 'px';
                    imgText.style.marginBottom = String(appProp.imageTextMarginB) + 'px';
                    
                }
                
            }
            
            dataController.updateImageBoxList();
                        
            // 3. Realign elements
          
        },
        
        resetDimensions: function(){
            // Get original size ratio related to current size
            var originalRatio = startingRatio / currentRatio;
            UIController.changeMapDimensions(originalRatio);
            
            // Reset currentRatio to startingRatio
            currentRatio = startingRatio;
        },
        
        resizeMap: function(){
            
            var wHeight = window.innerHeight;
            var resizeFloor = 700;
            
            if(wHeight > resizeFloor){
                UIController.changeMapDimensions(Math.floor(wHeight / resizeFloor));
                startingRatio = Math.floor(wHeight / resizeFloor); 
            }
            
        },
        
        // Options Panel
        
        triggerOption: function(e){
        
            var optionID = String(e.target.parentNode.id);
            
            // Hide text boxes
            if(optionID.indexOf('titles') !== -1){
                
                if(e.target.checked){
                    
                    UIController.toggleTexts('show');
                    appController.getOptions().displayTitles = true;
                    
                } else {
                    
                    UIController.toggleTexts('hide');
                    appController.getOptions().displayTitles = false;
                    
                }
                
            } 
            
            // Change to Light / Dark colors
            else if (optionID.indexOf('colors') !== -1){
                
                var elementClass = e.target.className;
                var appHolder = $select(DOMStrings.appHolder);
                                    
                Velocity(appHolder, 'stop');
                Velocity(appHolder, {opacity: 0}, {delay: 0, easing: "easeOut", duration: 100, complete: changeColors});
                
                function changeColors(){
                    
                    if(elementClass.indexOf('light') !== -1){
                        // Light Color
                        document.body.classList.remove('dark');
                        appController.getOptions().colorScheme = 'light';

                    } else if (elementClass.indexOf('dark') !== -1){
                        // Dark Color
                        document.body.className += " " + 'dark';
                        appController.getOptions().colorScheme = 'dark';

                    }
                    
                    Velocity(appHolder, {opacity: 1}, {delay: 0, easing: "easeOut", duration: 200});
                }
                
            }
            
            else if (optionID.indexOf('template') !== -1){
                
                // Check if the same template was clicked
                var newTemplateClass = String(e.target.id).split('_')[1];
                
                if(currentTemplate !== Templates[newTemplateClass]){
                    
                    // Check if there are images on the current template and ask to confirm the change, if needed

                    var imgBoxList = dataController.getImageBoxList();
                    var hasImage = false;

                    for(var j = 0; j < imgBoxList.length; j++){

                        if($id(imgBoxList[j].imgID).getElementsByClassName('img_element')[0]){
                            hasImage = true;
                            break;
                        }

                    }

                    if(hasImage){UIController.confirmTemplateChange(e);}
                    else {UIController.changeTemplate(e);}

                }
            }
           
            e.onmouseover = function(){};
            e.onmouseout = function(){};
        },
        
        toggleTexts: function(type){
            
            var imageBoxList = dataController.getImageBoxList();
            
            for(var i = 0; i < imageBoxList.length; i++){
                
                var inputTitle = $id(imageBoxList[i].imgID).getElementsByClassName('input_title')[0];
                
                if(inputTitle !== undefined){
                    
                    if(type === 'hide') inputTitle.style.display = 'none';
                    else if (type === 'show') inputTitle.style.display = 'block';
                    
                }
            }
            
        },
        
        changeTemplate: function(e){
        
            var eMap = $select(DOMStrings.mapHolder);
            var eCredits = $select(DOMStrings.credits);

            Velocity([eMap, eCredits], {opacity: 0}, {delay: 0, easing: "easeOut", duration: 150, complete: showNewTemplate});
            
            function showNewTemplate(){
            
                // 1. Updates Options UI
                var listOfButtons = $select('.option_templates').getElementsByClassName('btn');
                var currentButton = $id(e.target.id);

                for(var j = 0; j < listOfButtons.length; j++){
                    listOfButtons[j].classList.remove('current_template');
                }

                currentButton.classList.add('current_template');

                // 2. Reset map dimensions to default to avoid anomalies in layout
                UIController.resetDimensions();

                // 3. Remove all image boxes from DOM
                var mapHolder = $select('.map');

                for(var i = 0; i < dataController.getImageBoxList().length; i++){

                    mapHolder.removeChild(mapHolder.childNodes[0]);

                }

                // 4. Remove imageBoxList and imageList objects
                dataController.resetLists();

                // 5. Remove current template class from '.app'
                document.body.classList.remove(currentTemplate.class);

                // 6. Get data from new template, update current template and options object
                var newTemplateClass = String(e.target.id).split('_')[1];
                currentTemplate = Templates[newTemplateClass];
                appController.getOptions().currentTemplate = newTemplateClass;

                // 7. Add new class 'template-X' to '.app'
                document.body.classList.add(newTemplateClass);

                // 8. Populate DOM with new image boxes
                UIController.createImageBoxes();

                // 9. Update imageBoxList
                dataController.storeImageBoxList();

                // 10. Add event listeners
                appController.addImageBoxEvents();
                
                // 11. Show new map
                Velocity([eMap, eCredits], {opacity: 1}, {delay: 0, easing: "easeOut", duration: 150});
            }    
            
        },
        
        confirmTemplateChange: function(e){
            
            // Display warning
            
            var element = $select(DOMStrings.confirmBox);
        
            element.style.display = 'block';
            
            Velocity(element, 'stop');
            Velocity(element, 'fadeIn', {delay: 0, easing: "easeOut", duration: 300});
            
            // Confirm Box Events
            $select(DOMStrings.confirmBtnYes).onclick = function(){
                UIController.changeTemplate(e);
                fadeOutConfirm();
            }
            
            $select(DOMStrings.confirmBtnNo).onclick = $select(DOMStrings.confirmBgOverlay).onclick = function(){
                fadeOutConfirm();
            }
            
            function fadeOutConfirm(){
                Velocity(element, 'stop');
                Velocity(element, 'fadeOut', {delay: 0, easing: "easeOut", duration: 300});
            }
            
        }

    }

})();

/*

Data Controller

*/

var dataController = (function(){
    
    var mapElement = {};
    var imageBoxList = [];
    var imageList = [];
    
    var DOM = UIController.getDOMStrings();
    
    var ImageBox = function(ID, imgID, imgCont, sizeW, sizeH, posX, posY){
        
        this.id = ID;
        this.imgID = imgID;
        this.hasContent = imgCont;
        this.sizeW = sizeW;
        this.sizeH = sizeH;
        this.posX = posX;
        this.posY = posY;
        
    }
    
    var ImageElement = function(imgID, sizeW, sizeH, posX, posY){
        
        this.id = imgID;
        this.sizeW = sizeW;
        this.sizeH = sizeH;
        this.posX = posX;
        this.posY = posY;
        
    }
    
    return {
        
        storeMapData: function(){
        
            var appObj = $id('image_content_holder');
            var mapObj = $select(DOM.mapHolder);
            
            // Main holder data
            
            function splitToNumber(obj, property){
                
                var myObj = obj;
                var myProp = property;
                
                return dataController.splitPxToNumber(window.getComputedStyle(myObj,null).getPropertyValue(myProp));
                
            }
            
            mapElement.hSizeW = appObj.offsetWidth;
            mapElement.hSizeH = appObj.offsetHeight;
            mapElement.hPosX = appObj.offsetLeft;
            mapElement.hPosY = appObj.offsetTop;  
            
            mapElement.sizeW = mapObj.offsetWidth;
            mapElement.sizeH = mapObj.offsetHeight;
            mapElement.posX = splitToNumber(mapObj, 'margin-left');
            mapElement.posY = splitToNumber(mapObj, 'margin-top');
            
            // Font size and position from texts
            
            var text1Value = splitToNumber($select(DOM.author), 'font-size');
            var text1PosYValue = splitToNumber($select(DOM.author), 'padding-top');
            var text2Value = splitToNumber($select(DOM.credits), 'font-size');
            var text2PosYValue = splitToNumber($select(DOM.credits), 'padding-top');
            var textNameValue = splitToNumber($select(DOM.inputAuthor), 'font-size');
            var imageTextValue = 11; // Forcing default
            var imageTextMarginL = 7; // Forcing default
            var imageTextMarginB = 7; // Forcing default
            
            mapElement.text1Size = text1Value; 
            mapElement.text1PosY = text1PosYValue; 
            mapElement.text2Size = text2Value;
            mapElement.text2PosY = text2PosYValue;
            mapElement.textNameSize = textNameValue;
            mapElement.imageTextSize = imageTextValue;
            mapElement.imageTextMarginL = imageTextMarginL;
            mapElement.imageTextMarginB = imageTextMarginB;
            
        },
        
        storeImageBoxList: function(){
            
            // Populate imageBoxList with data
            var getChildNodes, newImageBox, newImage, idList;
            
            getChildNodes = $select(DOM.mapHolder).childNodes;   
            
            imageBoxList = [];
            imageList = [];
            idList = 0;
            
            for(var i = 0; i < getChildNodes.length; i++){
                
                if (getChildNodes[i].id !== undefined) {                    
                    
                    var curIdList = idList++;
                    var element = $id(getChildNodes[i].id);
                    
                    var sizeW = element.offsetWidth;
                    var sizeH = element.offsetHeight;
                    var posX = element.offsetLeft;
                    var posY = element.offsetTop;
                    
                    // Create data from new imageBox
                    newImageBox = new ImageBox(curIdList, getChildNodes[i].id, false, sizeW, sizeH, posX, posY);
                    
                    // Create default data for new images
                    newImage = new ImageElement(curIdList,0,0,0,0);
                    
                    // Store data on both arrays
                    imageBoxList.push(newImageBox);
                    imageList.push(newImage);
                    
                }
            }
            
        },
        
        getMapData: function(){
            return mapElement;
        },
        
        getImageBoxList: function(){
            return imageBoxList;
        },
        
        getImageList: function(){
            return imageList;
        },
                
        updateMapData: function(appProp){
            
            // Store new dimensions
            mapElement.hSizeW = appProp.hSizeW;
            mapElement.hSizeH = appProp.hSizeH;
            mapElement.sizeW = appProp.sizeW;
            mapElement.sizeH = appProp.sizeH;
            mapElement.posX = appProp.posX;
            mapElement.posY = appProp.posY;
            mapElement.text1Size = appProp.text1Size;
            mapElement.text1PosY = appProp.text1PosY;
            mapElement.text2Size = appProp.text2Size;
            mapElement.text2PosY = appProp.text2PosY;
            mapElement.textNameSize = appProp.textNameSize;
            mapElement.imageTextSize = appProp.imageTextSize;
            mapElement.imageTextMarginL = appProp.imageTextMarginL;
            mapElement.imageTextMarginB = appProp.imageTextMarginB;
            
        },
        
        updateImageBoxList: function(){
        
            // Check every image box for content
            for(var i = 0; i < imageBoxList.length; i++)
            {
                var imgBox = $id(imageBoxList[i].imgID);
                
                imageBoxList[i].sizeW = imgBox.offsetWidth;
                imageBoxList[i].sizeH = imgBox.offsetHeight;
                imageBoxList[i].posX = imgBox.offsetLeft;
                imageBoxList[i].posY = imgBox.offsetTop;
                
                if(imgBox.getElementsByClassName('img_element')[0]){
                    
                    // Contain image
                    imageBoxList[i].hasContent = true;
                    
                } else {
                    
                    // Doesn't contain image
                    imageBoxList[i].hasContent = false;
                    
                }
            }
            
        },
        
        updateImageList: function(imgID, sizeW, sizeH, posX, posY){
            
            var curID = parseInt(String(imgID).split('x')[1]) - 1;
            imageList[curID].sizeW = dataController.splitPxToNumber(sizeW);
            imageList[curID].sizeH = dataController.splitPxToNumber(sizeH);
            imageList[curID].posX = dataController.splitPxToNumber(posX);
            imageList[curID].posY = dataController.splitPxToNumber(posY);
        
        },
        
        resetLists: function(){
            
            imageBoxList = [];
            imageList = [];
            
            dataController.storeImageBoxList();
            
        },
        // Utilities
        
        splitPxToNumber: function(e){
            return parseInt(String(e).split('p')[0]);
        },
        
        // Interpret new image request
        
        fileSelectHandler: function(e) {

            var imgID;
            
            // Check the conditions of new request
            // If it's an upload click OR existing image
            if(String(e.target.type) === 'file' || String(e.target).search('Image') > 0){
                imgID = e.target.parentNode.id;    
            } // If it's an empty box
            else {
                imgID = e.target.id;
            }
            
            // Cancel event and hover styling
            UIController.fileDragHover(e);
            
            // Fetch FileList object
            var files = e.target.files || e.dataTransfer.files;
            
            // Process all File objects
            for (var i = 0, f; f = files[i]; i++) {
                
                UIController.parseFile(f, imgID);
                
            }
        }, 
        
    }
        
})();

/*

App Controller

*/

var appController = (function(){
    
    var DOM = UIController.getDOMStrings();
    
    var mapElement = [];
    var canvasHolder;
    
    var options = {
        displayTitles: true,
        colorScheme: 'light',
        currentTemplate: 'template1'
    }
    
    var setEventListeners = function(){
       
        // Author Name - Input Text
        $select(DOM.inputAuthor).addEventListener('focus', function(){UIController.inputFocus(this, 'on', 'Escreva Seu Nome')});
        $select(DOM.inputAuthor).addEventListener('focusout', function(){UIController.inputFocus(this, 'out', 'Escreva Seu Nome')});
        
        // Button Options Box
        $select(DOM.btnOptions).addEventListener('mouseover', function(){showMenuBox('.options_box', '55px')});
        $select(DOM.optionsBox).addEventListener('mouseleave', hideAllBoxes);
        // Button Save
        $select(DOM.btnSave).addEventListener('mouseover', hideAllBoxes);
        // Button Info Box
        $select(DOM.btnInfo).addEventListener('mouseover', function(){showMenuBox('.info_box', '60px')});
        $select(DOM.btnInfo).addEventListener('mouseleave', hideAllBoxes);
        // Button Support Box
        $select(DOM.btnSupport).addEventListener('click', function(){
            var win = window.open('https://iconicnetwork.typeform.com/to/GuHMMi', '_blank');
            win.focus();    
        });
        
        $select(DOM.btnSupport).addEventListener('mouseover', function(){showMenuBox('.support_box', '60px')});
        $select(DOM.btnSupport).addEventListener('mouseleave', hideAllBoxes);
        
        // Options Box Listeners
        $id('opt_titles_checkbox').addEventListener('change', UIController.triggerOption);
        $select('.option_colors .color_light').addEventListener('click', UIController.triggerOption);
        $select('.option_colors .color_dark').addEventListener('click', UIController.triggerOption);
        $id('btn_template1').addEventListener('click', UIController.triggerOption);
        $id('btn_template2').addEventListener('click', UIController.triggerOption);
        $id('btn_template3').addEventListener('click', UIController.triggerOption);
        
        // Button Preview Map
        $select(DOM.btnSave).addEventListener('click', previewMap); 
        $select('.warning_box').addEventListener('click', UIController.closeWarning); 
        
        // Preview Map Events
        $select(DOM.previewBtnDownload).addEventListener('click', downloadImage);
        $select(DOM.previewBgOverlay).addEventListener('click', closePreview);
        $select(DOM.previewBtnClosePreview).addEventListener('click', closePreview);
        
        // Image Boxes Events
        addImgBoxEventListeners();
        
        // On exit page
        /*window.onbeforeunload = function(){
            return 'Tem certeza que deseja sair?';
        };*/
    }
    
    var addImgBoxEventListeners = function(){

        if (window.File && window.FileList && window.FileReader) {

            var xhr = new XMLHttpRequest();
            var imageBoxList = dataController.getImageBoxList();
            
            if (xhr.upload) {
                
                for(var i = 0; i < imageBoxList.length; i++){
                    
                    var imgBox, imgUploadBtn;
                    imgBox = $id(imageBoxList[i].imgID);
                    imgUploadBtn = imgBox.getElementsByClassName('input_file')[0];

                    imgBox.addEventListener("mouseenter", UIController.imageBoxMouseEnter, false);
                    imgBox.addEventListener("dragover", UIController.fileDragHover, false);
                    imgBox.addEventListener("drop", dataController.fileSelectHandler, false);
                    imgBox.addEventListener("mousedown", UIController.dragImage, false);
                    imgBox.addEventListener("mouseup", function(){UIController.releaseDragImage(this)});
                    imgBox.addEventListener("dragleave", UIController.fileDragHover, false);

                    // Click to Upload
                    imgUploadBtn.addEventListener("change", dataController.fileSelectHandler);

                }
            }
        }
    }
    
    var showMenuBox = function(e, posY){
        
        var element = $select(e);
        
        hideAllBoxes(element);
        element.style.display = 'block';
        Velocity(element, 'stop');
        Velocity(element, { top: posY },{delay: 0, easing: "easeOutExpo", duration: 800});
        
    }
    
    var hideAllBoxes = function(e){
        
        var elementOptions = $select(DOM.optionsBox);
        var elementInfo = $select(DOM.infoBox);
        var elementSupport = $select(DOM.supportBox);
        
        var elements = [elementOptions, elementInfo, elementSupport];
        
        var elementsToAnimate = [];
        
        for(var i = 0; i < elements.length; i++){
            
            if(e !== elements[i]){
                Velocity(elements[i], 'stop');
                elementsToAnimate.push(elements[i]);
            }
            
        }
        
        Velocity(elementsToAnimate, { top: '-250px' },{delay: 0, easing: "linear", duration: 300, complete: function(){
            
            for(var j = 0; j < elementsToAnimate.length; j++){
                elementsToAnimate[j].style.display = 'none';
            }
            
        }});
            
    }
    
    // Map render and preview events
    
    var previewMap = function(e) {
    
        // Check for missing elements
        var noName, imgBoxList, emptyBoxes, emptyTitles;
        
        noName = ($select(DOM.inputAuthor).value === 'Escreva Seu Nome');
        imgBoxList = dataController.getImageBoxList();
        emptyBoxes = emptyTitles = 0;
        
        // Check for empty boxed and empty titles
        for(var i = 0; i < imgBoxList.length; i++){
            
            if(!imgBoxList[i].hasContent){
                
                emptyBoxes++;
                
            } else {
                
                var dltBtn = $id(imgBoxList[i].imgID).getElementsByClassName('btn_delete_image')[0];
                
                dltBtn.style.display = 'none';
                
                var inputTitle = $id(imgBoxList[i].imgID).getElementsByClassName('input_title')[0];
                
                if(inputTitle.value === 'Adicionar Título'){
                    emptyTitles++;
                }
            }
            
        }
        
        // Check if map name exists
        if(noName){
            
            UIController.giveWarning('Ops! Você não inseriu um nome no mapa.');
            
        } // Check if there's any empty boxes
        /*else if(emptyBoxes > 0){
            
            if(emptyBoxes > 1) UIController.giveWarning('Ops! Existem ' + emptyBoxes + ' caixas de imagem ainda vazias.');
            
            else if(emptyBoxes == 1) UIController.giveWarning('Ops! Existe ' + emptyBoxes + ' caixa de imagem ainda vazia.');
            
        } // Check if there're any images without title
        else if(emptyTitles > 0 && appController.getOptions().displayTitles){
            
            if(emptyTitles > 1) UIController.giveWarning('Ops! Existem ' + emptyTitles + ' títulos de imagem ainda vazios.');
            
            else if(emptyTitles == 1) UIController.giveWarning('Ops! Existe ' + emptyTitles + ' título de imagem ainda vazio.');
            
        }*/ // Display preview
        else {
            
            // Hide original map
            Velocity($select(DOM.mapCover), 'fadeIn', {delay: 0, easing: "linear", duration: 100, complete: function(){

                var scaleRatio = 2;
                
                // Set initial UI conditions to Preview Map
                $select('.app').classList.add('preview_mode');
                UIController.changeMapDimensions(scaleRatio);

                // Adjust texts

                var adjustedText = {

                    author: 'Mapa de Influências',
                    authorAdjust: 'M&nbsp;a&nbsp;p&nbsp;a&nbsp;&nbsp;&nbsp;d&nbsp;e&nbsp;&nbsp;&nbsp;I&nbsp;n&nbsp;f&nbsp;l&nbsp;u&nbsp;ê&nbsp;n&nbsp;c&nbsp;i&nbsp;a&nbsp;s',
                    credits: 'labs.iconic.network/mapa',
                    creditsAdjust: 'l&nbsp;a&nbsp;b&nbsp;s&nbsp;.&nbsp;i&nbsp;c&nbsp;o&nbsp;n&nbsp;i&nbsp;c&nbsp;.&nbsp;n&nbsp;e&nbsp;t&nbsp;w&nbsp;o&nbsp;r&nbsp;k&nbsp;/&nbsp;m&nbsp;a&nbsp;p&nbsp;a'

                }

                function adjustText(type){

                    var imgBList = dataController.getImageBoxList();
                    
                    if(type){
                        $select('.author .text').innerHTML = adjustedText.authorAdjust;
                        $select('.credits').innerHTML = adjustedText.creditsAdjust;
                        $select('.author .text').style.letterSpacing = '0px';
                        $select('.credits').style.letterSpacing = '0px';
                    } else {
                        $select('.author .text').innerHTML = adjustedText.author;
                        $select('.credits').innerHTML = adjustedText.credits;
                        $select('.author .text').style.letterSpacing = '2px';
                        $select('.credits').style.letterSpacing = '2px';
                    }

                    
                    // Adjust input titles

                    for(var i = 0; i < imgBList.length; i++){

                        var imgInput = $id(imgBList[i].imgID).getElementsByClassName('input_title')[0];
                        
                        if(type){
                            
                            if(imgInput !== undefined){
                                // Change shadow size
                                imgInput.style.textShadow = '0px 0px ' + (5 * scaleRatio) + 'px rgba(79, 59, 92, 1)';
                                // Remove padding from titles
                                imgInput.style.marginLeft = '7px';
                            }
                            
                        } else {
                            
                            if(imgInput !== undefined){
                                // Change shadow size
                                imgInput.style.textShadow = '0px 0px 5px rgba(79, 59, 92, 1)';
                                // Remove padding from titles
                                imgInput.style.marginLeft = '7px';
                            }
                            
                        }
                    }
                    
                   
                }

                var previewChild = $select('.img_holder');

                adjustText(true);

                // In case there's already a rendered canvas, delete it
                if(previewChild.childNodes.length > 0){
                    previewChild.removeChild(previewChild.childNodes[0]);
                }

                // Show new canvas
                var element = $id('image_content_holder');
                var canvasObj;

                var previewElements = displayCanvas();

                // Append canvas
                html2canvas(element).then(function(canvas) {

                    Velocity(previewElements.loadingIcon, 'fadeOut', {delay: 0, easing: "linear", duration: 200, complete: function(){

                        $select('.img_holder').append(canvas);
                        canvasObj = canvas;
                        canvasHolder = canvasObj;
                        adjustCanvas(canvasObj); 

                        Velocity([previewElements.imgHolder, previewElements.btnDownload, previewElements.btnVoltar], 'fadeIn', {delay: 0, easing: "linear", duration: 200});

                        // Return initial conditions

                        adjustText(false);
                        UIController.resetDimensions();    

                    }});

                });

            //
            }});  
        } 
    }
    
    var closePreview = function(e){
        
        var element = $select(DOM.previewBox);
        
        Velocity(element, 'stop');
        Velocity(element, 'fadeOut', {delay: 0, easing: "easeOut", duration: 300});
        
        $select('.app').classList.remove('preview_mode');
        Velocity($select(DOM.mapCover), 'fadeOut', {delay: 0, easing: "linear", duration: 100});
        
    }   
    
    var adjustCanvas = function(canvas){
        
        var canvasObj, cvsHolder, scaleRatio, holderW, holderH, maxHeight, btDownload, btBack;
        
        canvasObj = canvas;
        cvsHolder = canvas.parentNode;
        maxHeight = window.innerHeight - 150;
        
        holderW = canvasObj.width;
        holderH = canvasObj.height;
        
        // Check if canvas is taller than screen - 150px
        if(canvasObj.height > maxHeight){

            canvasObj.style.height = maxHeight + 'px';
            scaleRatio = maxHeight / canvasObj.height;
            holderH = canvasObj.style.getPropertyValue('height').split('p')[0];
            holderW = Math.round(holderW * scaleRatio);
            canvasObj.style.width = holderW + 'px';
            
            // Adjust holder's height
            cvsHolder.style.height = holderH + 'px'; 
        }
                
        // Align canvas
        
        cvsHolder.style.left = '50%';
        cvsHolder.style.top = '50%';
        cvsHolder.style.marginLeft = '-' + Math.round(holderW / 2) + 'px';
        cvsHolder.style.marginTop = '-' + Math.round(holderH / 2) + 'px';
        
        // Align buttons
        
        btDownload = $select('.btn_preview_download');
        btBack = $select('.btn_preview_close');
        
        btDownload.style.left = '50%';
        btDownload.style.top = '50%';
        btDownload.style.marginLeft = Math.ceil(holderW / 2) + 15 + 'px';
        btDownload.style.marginTop = '-' + Math.ceil(holderH / 2) + 'px';
        
        btBack.style.left = '50%';
        btBack.style.top = '50%';
        btBack.style.marginLeft = Math.ceil(holderW / 2) + 15 + 'px';
        btBack.style.marginTop = '-' + (Math.ceil(holderH / 2) - 42) + 'px';
    }
    
    var displayCanvas = function(){
        
        // Display canvas
        var elements = {
            previewBox: $select(DOM.previewBox),
            imgHolder: $select(DOM.previewImgHolder),
            btnDownload: $select(DOM.previewBtnDownload),
            btnVoltar: $select(DOM.previewBtnClosePreview),
            loadingIcon: $select(DOM.previewLoading)
        }
        
        elements.imgHolder.style.display = 'none';
        elements.btnDownload.style.display = 'none';
        elements.btnVoltar.style.display = 'none';        
        
        Velocity([elements.previewBox, elements.loadingIcon], 'stop');
        Velocity([elements.previewBox, elements.loadingIcon], 'fadeIn', {delay: 0, easing: "easeOut", duration: 300});
        
        return elements;
    }
    
    var downloadImage = function(e) {
        
        var imageData = canvasHolder.toDataURL("image/png");
        download(imageData, "mapa_influencia.png", "image/png" );
        
    }
    
    return {
        
        init: function(){
            
            // Insert UI on the image boxes
            UIController.createImageBoxes();
            //UIController.resizeMap();
            // Store map data
            dataController.storeMapData();
            // Store image boxes data
            dataController.storeImageBoxList();
            // Assign map data
            mapElement = dataController.getMapData();
            // Set main event listeners
            setEventListeners();
            
        },
        
        addImageBoxEvents: function(){
            addImgBoxEventListeners();
        },
        
        getOptions: function(){
            return options;
        }
        
    }
    
})();

appController.init();

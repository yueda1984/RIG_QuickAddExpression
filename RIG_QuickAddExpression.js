/*
	Quick_Add_Expression

	This Toon Boom Harmony shelf script creates a new expression column and link it to a specific node attribute of your choice.
	If multiple nodes are selected, this function will link the expression to all the nodes with the specified attribute.
	
		v1.2 - Fixed the problem where scale attributes did not show up on the list.
	
	
	Installation:
	
	1) Download and Unarchive the zip file.
	2) Locate to your user scripts folder (a hidden folder):
	   https://docs.toonboom.com/help/harmony-17/premium/scripting/import-script.html	
	   
	3) Add all unzipped files (*.js, and script-icons folder) directly to the folder above.
	4) Add RIG_Quick_Add_Expression to any toolbar.

	
	Direction:
	
	Run RIG_Quick_Add_Expression.
	You can also select nodes and then run the function, which will add "Add to" dropdown list to the dialog.
	This list includes all attributes that you can link the new expression column to.

	   
	Author:

		Yu Ueda (raindropmoment.com)
	
*/


var scriptVar = "1.2";


function RIG_Quick_Add_Expression()
{
	
	// ------------------ List Attributes of All Selected Nodes ------------------	
	

    function getFlatAttrList(argNode, validAttrList, parAttrName)
    {
        var attrList = node.getAttrList(argNode, 1, parAttrName);
        
        for (var i=0; i<attrList.length; i++)
        { 	
            var attrName = attrList[i].keyword();
            if (parAttrName !== "")
            {
                attrName = parAttrName + "." + attrName;
           }        
            var attrVal = node.getAttr(argNode, 1, attrName);
			attrVal = attrVal.toString();
            if (attrVal.indexOf("DoubleAttributeWrapper") !== -1 )
            {
                validAttrList.push(attrName);
           }
			var subAttrCheck = node.getAttrList(argNode, 1, attrName);
            if (subAttrCheck.length > 0)
            {
                var subList = getFlatAttrList(argNode, [], attrName);
                validAttrList.push.apply(validAttrList, subList);
           }
       }
        return validAttrList;
   }
	
	var numOfNodesSelected = selection.numberOfNodesSelected();
	var flatAttrList = [];
	
	for (var i=0; i < numOfNodesSelected; i++)
	{
		var tempList = getFlatAttrList(selection.selectedNode(i), [], "");
		flatAttrList.push.apply(flatAttrList, tempList);
	}
	// Add item "None" so users can skip linking new Expression to an attribute:
	flatAttrList.unshift("None");
	
	

	// ------------------ Dialog Box ------------------
	
	
	
	chooseAttrBox = new Dialog;
	chooseAttrBox.title = "Quick Add Expression";	
	
	chooseAttrBox.addSpace(10);
	
	// Name Input:
	var userInput1 = new LineEdit();
	userInput1.label = "Name:";	
	userInput1.text = "Expr_";
	
	chooseAttrBox.add(userInput1);
	chooseAttrBox.addSpace(10);	
	
	// Line Input:
	var userInput2 = new TextEdit();
	var defaultText = "Lines (Optional)"
	userInput2.text = defaultText;
	
	var textContainer = new GroupBox;
	textContainer.add(userInput2);
	
	chooseAttrBox.add(textContainer);
	
	// Attribute Selector:
	if (numOfNodesSelected > 0)
	{		
		var userInput3 = new ComboBox();
		userInput3.label = "Add to:";
		userInput3.itemList = flatAttrList;
		
		var comboBoxContainer = new GroupBox;
		comboBoxContainer.add(userInput3);
		
		chooseAttrBox.add(comboBoxContainer);
	}

	chooseAttrBox.addSpace(10);
	

	var rc = chooseAttrBox.exec();
	

	if (!rc)
	{
		return;
	}
	else
	{
		var newExprName = userInput1.text;	
		
		if (!newExprName)
		{
			var newExprName = "Expr";
		}
		
		var customLines = userInput2.text;
		
		if (numOfNodesSelected > 0)
		{
			if (userInput3.currentItem !== "None")
			{
				var targetAttr = userInput3.currentItem;
			}
		}
	}


	
	// ------------------ Expression Column Creation ------------------
	
	
	
	scene.beginUndoRedoAccum("Quick Add Expression");	
	
	
	
	// Create a new Expression column with a unique name:
	function addNewExpr (columnName)
	{
		var suffix = 0;
		var originalName = columnName;

		while (column.getDisplayName(columnName))    //true == name is taken
		{
			suffix += 1;
			columnName = originalName + "_" + suffix;	
		} 
		
		column.add(columnName, "EXPR");
		
		if (customLines !== defaultText)
		{
			column.setTextOfExpr(columnName, customLines);
		}

		return columnName;
	}
	
	// Link the argument column to the specified attribute:		
	function link2NewColumn(columnName, attrName, argNode)
	{
		node.unlinkAttr(argNode, attrName);
		node.linkAttr(argNode, attrName, columnName);
		column.setKeyFrame (columnName, 1);
	}	
	

	
	var newExprColumn = addNewExpr(newExprName);
	
	for (var ii=0; ii<numOfNodesSelected; ii++)
	{
		if (targetAttr)
		{
			link2NewColumn(newExprColumn, targetAttr, selection.selectedNode(ii));
		}
	}
	

	scene.endUndoRedoAccum();

}
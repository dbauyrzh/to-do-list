//jshint esversion:6

const express = require("express");
const _ = require('lodash');
const mongoose = require('mongoose');
const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://dastanbn98:Paramount98@cluster0.pzuivfg.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true

});
const itemsSchema = {
  name: String
};
const Item = mongoose.model(
  "Item",
  itemsSchema
);

const buy = new Item({
  name: "Buy Food"
});
const cook = new Item({
  name: "Cook Food"
});
const eat = new Item({
  name: "Eat Food"
});
const defaultItems = [buy, cook, eat];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({})
    .then(function(items) {
      if (items.length == 0) {
        Item.insertMany(defaultItems)
          .then(function() {
            console.log("First 3 items are inserted");
          })
          .catch(function(err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: items
        });
      }
    })
    .catch(function(err) {
      console.log(err);
    });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
      .then(function(foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(function(item) {
        res.redirect("/");
      })
      .catch(function(err) {
        console.log(err);
      })

  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}}
    )
    .then(function(item) {
      res.redirect("/" + listName);
    })
    .catch(function(err) {
      console.log(err);
    });
  }


});

app.get("/:customList", function(req, res) {
  const customListName = _.capitalize(req.params.customList);
  List.findOne({name: customListName})
    .then(function(foundList) {
      if(!foundList) {
        const list = new List ({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    })

});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

define('Config', function () {
    this.States = [
        {
            name: "benchmark",
            url: "/benchmark",
            sections: [
                ["main", "benchmark"],
            ]
        },
        {
            name: "binding",
            url: "/binding",
            sections: [
                ["main", "bind"],
            ]
        },
        {
            name: "reference",
            url: "/",
            sections: [
                ["main", "reference"]
            ]
        },
        {
            name: "red",
            url: "/red",
            sections: [
                ["main", "reference"],
                ["goto-test", "red"]
            ]
        },
        {
            name: "green",
            url: "/green",
            sections: [
                ["main", "reference"],
                ["goto-test", "green"]
            ]
        }
    ];
});



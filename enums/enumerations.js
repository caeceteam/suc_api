var enumerations = {
    dinerStates: {
        "inactive": -1,
        "pending": 0,
        "approved": 1,
        "rejected": 2
    },
    userActive: {
        "false": 0,
        "true": 1
    },
    userRole: {
        "sysAdmin" : 0,
        "dinerAdmin" : 1,
        "employee": 2,
        "colaborator": 3
    }
};

module.exports = {
    enums: enumerations
}
SQLite format 3   @                                                                     .zp   	 �O�l
Y	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           �C--�9tabletest_to_packagestest_to_packagesCREATE TABLE test_to_packages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        packageID INTEGER,
        testID INTEGER,
        FOREIGN KEY (packageID) REFERENCES packages(id) ON DELETE CASCADE,
        FOREIGN KEY (testID) REFERENCES tests(id) ON DELETE CASCADE
      )��stablepackagespackagesCREATE TABLE packages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(100),
        customePrice INTEGER,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )�-�9tableteststestsCREATE TABLE tests(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(50),
      price INTEGER, 
      normal TEXT,
      options TEXT,
      isSelecte INTEGER,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)�0�;tablevisitsvisitsCREATE TABLE visits(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientID INTEGER,
        status TEXT DEFAULT "PENDING" NOT NULL,
        testType VARCHAR(50),
        tests TEXT,
        discount INTEGER,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patientID) REFERENCES patients(id) ON DELETE CASCADE
      )P++Ytablesqlite_sequencesqlite_sequenceCREATE TABLE sqlite_sequence(name,seq)�\�tablepatientspatientsCREATE TABLE patients(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        birth DATE NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )   � �8��)��3�k�                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             ]	 #=33Ali Newmale077109909891970-07-02T07:21:48.000Z2024-07-02 07:32:072024-07-02 07:32:07]	 #=33Ali Newmale077109909891970-07-02T07:21:48.000Z2024-07-02 07:21:582024-07-02 07:21:58b	 !#=33Patient 33female077284221062001-06-30T18:50:06.000Z2024-07-01 18:35:572024-07-01 18:35:57b	 !#=33Patient 33female077284221062001-06-30T18:50:06.000Z2024-07-01 18:29:142024-07-01 18:29:14P
	 =33adafemale2020-07-01T13:48:01.000Z2024-07-01 15:35:182024-07-01 15:35:18P		 =33adafemale2020-07-01T13:48:01.000Z2024-07-01 15:33:392024-07-01 15:33:39P	 =33adafemale2020-07-01T13:48:01.000Z2024-07-01 14:07:482024-07-01 14:07:48b	 !#=33Patient 33female077284221062001-06-30T18:50:06.000Z2024-07-01 13:50:362024-07-01 13:50:36P	 =33adafemale2020-07-01T13:48:01.000Z2024-07-01 13:48:042024-07-01 13:48:04W	 =33addNewfemale08882020-07-01T13:42:33.000Z2024-07-01 13:42:372024-07-01 13:42:37b	 !#=33Patient 33female077284221062001-06-30T18:50:06.000Z2024-07-01 13:41:212024-07-01 13:41:21b	 !#=33Patient 33female077284221062001-06-30T18:50:06.000Z2024-07-01 12:15:502024-06-30 19:50:22� ������                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
visitspackages-test_to_packages� 	visitses	tests   		patipatients   	� �PC	�                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         �W
 �9 33PENDING"PACKAGE"[{"id":2,"title":"editPackage","customePrice":2000,"createdAt":"2024-06-30 09:38:16","updatedAt":"2024-06-30 10:43:36","tests":[{"id":5,"name":"Foo","price":3000,"normal":"test","options":"[]","isSelecte":0,"updatedAt":"2024-06-30 09:31:33","createdAt":"2024-06-30 09:31:33"}]}]2024-07-02 07:32:072024-07-02 07:32:07�

 �33PENDING"PACKAGE"[{"id":4,"title":"addPackage ","customePrice":2,"createdAt":"2024-06-30 11:28:34","updatedAt":"2024-06-30 11:28:34","tests":[{"id":5,"name":"Foo","price":3000,"normal":"test","options":"[]","isSelecte":0,"updatedAt":"2024-06-30 09:31:33","createdAt":"2024-06-30 09:31:33"}]},{"id":6,"title":"ass","customePrice":null,"createdAt":"2024-06-30 19:56:38","updatedAt":"2024-06-30 19:56:38","tests":[{"id":6,"name":"qq","price":1,"normal":"qq","options":"[\"positive\",\"negative\"]","isSelecte":1,"updatedAt":"2024-06-30 11:14:20","createdAt":"2024-06-30 11:14:20"},{"id":5,"name":"Foo","price":3000,"normal":"test","options":"[]","isSelecte":0,"updatedAt":"2024-06-30 09:31:33","createdAt":"2024-06-30 09:31:33"}]}]�2024-07-02 07:21:582024-07-02 07:21:58�T
 �3 33PENDING"PACKAGE"[{"id":4,"title":"addPackage ","customePrice":2,"createdAt":"2024-06-30 11:28:34","updatedAt":"2024-06-30 11:28:34","tests":[{"id":5,"name":"Foo","price":3000,"normal":"test","options":"[]","isSelecte":0,"updatedAt":"2024-06-30 09:31:33","createdAt":"2024-06-30 09:31:33"}]}]2024-07-01 18:35:572024-07-01 18:35:57W	 K 33PENDING["CUSTOME test","PACKAGE test"]
2024-07-01 09:50:452024-07-01 09:50:45" � ���                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        J	 	;	33qqqq["positive","negative"]2024-06-30 11:14:202024-06-30 11:14:20   �S	33test122["positive","negative","www","fff"]2024-06-30 09:31:052024-06-30 09:21:37   F!	33NewTests11N 22["add"]2024-06-30 11:13:532024-06-30 09:21:16:	 33Foo�test[]2024-06-30 09:31:332024-06-30 09:31:33� $ ^$��                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    8 #33addPackage 2024-06-30 11:28:342024-06-30 11:28:349 #33editPackage�2024-06-30 09:38:162024-06-30 10:43:36   62 33qqqqq2024-06-30 11:38:552024-06-30 11:38:/  33ass2024-06-30 19:56:382024-06-30 19:56:38� � ������������                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               � �     �  	  �         